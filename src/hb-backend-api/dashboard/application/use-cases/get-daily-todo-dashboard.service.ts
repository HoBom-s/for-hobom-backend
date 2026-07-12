import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { DailyTodoEntity } from "../../../daily-todo/domain/entity/daily-todo.entity";
import { CategoryEntity } from "../../../category/domain/model/category.entity";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { DashboardPeriod } from "../../domain/enums/dashboard-period.enum";
import {
  DailyTodoDashboardResult,
  GetDailyTodoDashboardUseCase,
} from "../../domain/ports/in/get-daily-todo-dashboard.use-case";

interface DailyTodoFacetResult {
  daily: { _id: string; total: number; completed: number }[];
  byCategory: { _id: Types.ObjectId; total: number; completed: number }[];
  byCycle: { _id: string; total: number; completed: number }[];
  overview: { total: number; completed: number; reactionsCount: number }[];
}

@Injectable()
export class GetDailyTodoDashboardService implements GetDailyTodoDashboardUseCase {
  constructor(
    @InjectModel(DailyTodoEntity.name)
    private readonly dailyTodoModel: Model<DailyTodoEntity>,
    @InjectModel(CategoryEntity.name)
    private readonly categoryModel: Model<CategoryEntity>,
  ) {}

  public async invoke(
    owner: UserId,
    period: DashboardPeriod,
    date: Date,
  ): Promise<DailyTodoDashboardResult> {
    const { startDate, endDate } = this.getDateRange(period, date);

    const [result] = await this.dailyTodoModel
      .aggregate<DailyTodoFacetResult>([
        {
          $match: {
            owner: owner.raw,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $facet: {
            daily: [
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$date" },
                  },
                  total: { $sum: 1 },
                  completed: {
                    $sum: {
                      $cond: [{ $eq: ["$progress", "COMPLETED"] }, 1, 0],
                    },
                  },
                },
              },
              { $sort: { _id: 1 } },
            ],
            byCategory: [
              {
                $group: {
                  _id: { $ifNull: ["$category.value", "$category"] },
                  total: { $sum: 1 },
                  completed: {
                    $sum: {
                      $cond: [{ $eq: ["$progress", "COMPLETED"] }, 1, 0],
                    },
                  },
                },
              },
            ],
            byCycle: [
              {
                $group: {
                  _id: "$cycle",
                  total: { $sum: 1 },
                  completed: {
                    $sum: {
                      $cond: [{ $eq: ["$progress", "COMPLETED"] }, 1, 0],
                    },
                  },
                },
              },
            ],
            overview: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  completed: {
                    $sum: {
                      $cond: [{ $eq: ["$progress", "COMPLETED"] }, 1, 0],
                    },
                  },
                  reactionsCount: {
                    $sum: {
                      $cond: [{ $ne: ["$reaction", null] }, 1, 0],
                    },
                  },
                },
              },
            ],
          },
        },
      ])
      .exec();

    const categories = await this.categoryModel
      .find({ _id: { $in: result.byCategory.map((c) => c._id) } })
      .lean()
      .exec();
    const categoryMap = new Map<string, string>(
      categories.map((c) => [c._id.toString(), c.title]),
    );

    const overview = result.overview[0] ?? {
      total: 0,
      completed: 0,
      reactionsCount: 0,
    };

    return {
      period,
      startDate,
      endDate,
      overview: {
        total: overview.total,
        completed: overview.completed,
        completionRate:
          overview.total > 0 ? overview.completed / overview.total : 0,
        reactionsCount: overview.reactionsCount,
      },
      daily: result.daily.map((d) => ({
        date: d._id,
        total: d.total,
        completed: d.completed,
        completionRate: d.total > 0 ? d.completed / d.total : 0,
      })),
      byCategory: result.byCategory.map((c) => ({
        categoryId: c._id.toString(),
        categoryTitle: categoryMap.get(c._id.toString()) ?? "Unknown",
        total: c.total,
        completed: c.completed,
      })),
      byCycle: result.byCycle.map((c) => ({
        cycle: c._id,
        total: c.total,
        completed: c.completed,
      })),
    };
  }

  private getDateRange(
    period: DashboardPeriod,
    date: Date,
  ): { startDate: Date; endDate: Date } {
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    if (period === DashboardPeriod.WEEKLY) {
      startDate.setDate(startDate.getDate() - 6);
    } else {
      startDate.setDate(startDate.getDate() - 29);
    }

    return { startDate, endDate };
  }
}
