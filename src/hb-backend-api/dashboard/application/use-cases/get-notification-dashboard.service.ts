import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { NotificationEntity } from "../../../notification/domain/model/notification.entity";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { DashboardPeriod } from "../../domain/enums/dashboard-period.enum";
import {
  GetNotificationDashboardUseCase,
  NotificationDashboardResult,
} from "../../domain/ports/in/get-notification-dashboard.use-case";

interface NotificationFacetResult {
  overview: { total: number; read: number; unread: number }[];
  dailyTrend: { _id: string; count: number }[];
  byCategory: { _id: string; count: number }[];
  recentUnread: {
    _id: Types.ObjectId;
    title: string;
    category: string;
    createdAt: Date;
  }[];
}

@Injectable()
export class GetNotificationDashboardService implements GetNotificationDashboardUseCase {
  constructor(
    @InjectModel(NotificationEntity.name)
    private readonly notificationModel: Model<NotificationEntity>,
  ) {}

  public async invoke(
    owner: UserId,
    period: DashboardPeriod,
    date: Date,
  ): Promise<NotificationDashboardResult> {
    const { startDate, endDate } = this.getDateRange(period, date);

    const [result] = await this.notificationModel
      .aggregate<NotificationFacetResult>([
        {
          $match: {
            owner: owner.raw,
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $facet: {
            overview: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  read: { $sum: { $cond: ["$isRead", 1, 0] } },
                  unread: { $sum: { $cond: ["$isRead", 0, 1] } },
                },
              },
            ],
            dailyTrend: [
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
            byCategory: [{ $group: { _id: "$category", count: { $sum: 1 } } }],
            recentUnread: [
              { $match: { isRead: false } },
              { $sort: { createdAt: -1 } },
              { $limit: 10 },
              { $project: { _id: 1, title: 1, category: 1, createdAt: 1 } },
            ],
          },
        },
      ])
      .exec();

    const overview = result.overview[0] ?? {
      total: 0,
      read: 0,
      unread: 0,
    };

    return {
      period,
      startDate,
      endDate,
      overview: {
        total: overview.total,
        read: overview.read,
        unread: overview.unread,
      },
      dailyTrend: result.dailyTrend.map((d) => ({
        date: d._id,
        count: d.count,
      })),
      byCategory: result.byCategory.map((c) => ({
        category: c._id,
        count: c.count,
      })),
      recentUnread: result.recentUnread.map((u) => ({
        id: u._id.toString(),
        title: u.title,
        category: u.category,
        createdAt: u.createdAt,
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
