import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DailyTodoEntity } from "../../../daily-todo/domain/entity/daily-todo.entity";
import { NoteEntity } from "../../../note/domain/model/note.entity";
import { FutureMessageEntity } from "../../../future-message/domain/model/future-message.entity";
import { NotificationEntity } from "../../../notification/domain/model/notification.entity";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { DashboardPeriod } from "../../domain/enums/dashboard-period.enum";
import {
  ActivityDashboardResult,
  GetActivityDashboardUseCase,
} from "../../domain/ports/in/get-activity-dashboard.use-case";

interface DateCountRow {
  _id: string;
  count: number;
}

@Injectable()
export class GetActivityDashboardService
  implements GetActivityDashboardUseCase
{
  constructor(
    @InjectModel(DailyTodoEntity.name)
    private readonly dailyTodoModel: Model<DailyTodoEntity>,
    @InjectModel(NoteEntity.name)
    private readonly noteModel: Model<NoteEntity>,
    @InjectModel(FutureMessageEntity.name)
    private readonly futureMessageModel: Model<FutureMessageEntity>,
    @InjectModel(NotificationEntity.name)
    private readonly notificationModel: Model<NotificationEntity>,
  ) {}

  public async invoke(
    owner: UserId,
    period: DashboardPeriod,
    date: Date,
  ): Promise<ActivityDashboardResult> {
    const { startDate, endDate } = this.getDateRange(period, date);

    const [dailyTodos, notes, futureMessages, notifications] =
      await Promise.all([
        this.dailyTodoModel
          .aggregate<DateCountRow>([
            {
              $match: {
                owner: owner.raw,
                date: { $gte: startDate, $lte: endDate },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$date" },
                },
                count: { $sum: 1 },
              },
            },
          ])
          .exec(),
        this.noteModel
          .aggregate<DateCountRow>([
            {
              $match: {
                owner: owner.raw,
                createdAt: { $gte: startDate, $lte: endDate },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
          ])
          .exec(),
        this.futureMessageModel
          .aggregate<DateCountRow>([
            {
              $match: {
                senderId: owner.toString(),
                createdAt: { $gte: startDate, $lte: endDate },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
          ])
          .exec(),
        this.notificationModel
          .aggregate<DateCountRow>([
            {
              $match: {
                owner: owner.raw,
                createdAt: { $gte: startDate, $lte: endDate },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
          ])
          .exec(),
      ]);

    const dateCountMap = new Map<string, number>();
    const moduleCountMap = new Map<string, number>();

    const addCounts = (data: DateCountRow[], moduleName: string): void => {
      let moduleTotal = 0;
      for (const row of data) {
        const current = dateCountMap.get(row._id) ?? 0;
        dateCountMap.set(row._id, current + row.count);
        moduleTotal += row.count;
      }
      moduleCountMap.set(moduleName, moduleTotal);
    };

    addCounts(dailyTodos, "daily-todo");
    addCounts(notes, "note");
    addCounts(futureMessages, "future-message");
    addCounts(notifications, "notification");

    const totalDays = period === DashboardPeriod.WEEKLY ? 7 : 30;
    const activeDays = dateCountMap.size;
    const totalActivities = [...moduleCountMap.values()].reduce(
      (a, b) => a + b,
      0,
    );

    const heatmap = this.buildHeatmap(startDate, endDate, dateCountMap);
    const { currentStreak, longestStreak } = this.calculateStreaks(
      heatmap,
      date,
    );

    const moduleUsage = [...moduleCountMap.entries()].map(
      ([module, count]) => ({
        module,
        count,
        percentage: totalActivities > 0 ? count / totalActivities : 0,
      }),
    );

    return {
      period,
      startDate,
      endDate,
      overview: {
        activeDays,
        totalDays,
        activityRate: totalDays > 0 ? activeDays / totalDays : 0,
        currentStreak,
        longestStreak,
      },
      heatmap,
      moduleUsage,
    };
  }

  private buildHeatmap(
    startDate: Date,
    endDate: Date,
    dateCountMap: Map<string, number>,
  ): { date: string; count: number; level: number }[] {
    const heatmap: { date: string; count: number; level: number }[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().slice(0, 10);
      const count = dateCountMap.get(dateStr) ?? 0;
      heatmap.push({ date: dateStr, count, level: this.getLevel(count) });
      current.setDate(current.getDate() + 1);
    }

    return heatmap;
  }

  private getLevel(count: number): number {
    if (count === 0) {
      return 0;
    }
    if (count <= 2) {
      return 1;
    }
    if (count <= 5) {
      return 2;
    }
    if (count <= 10) {
      return 3;
    }
    return 4;
  }

  private calculateStreaks(
    heatmap: { date: string; count: number }[],
    today: Date,
  ): { currentStreak: number; longestStreak: number } {
    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;
    const todayStr = today.toISOString().slice(0, 10);

    for (const entry of heatmap) {
      if (entry.count > 0) {
        streak++;
        longestStreak = Math.max(longestStreak, streak);
      } else {
        streak = 0;
      }
    }

    for (let i = heatmap.length - 1; i >= 0; i--) {
      if (heatmap[i].date > todayStr) {
        continue;
      }
      if (heatmap[i].count > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { currentStreak, longestStreak };
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
