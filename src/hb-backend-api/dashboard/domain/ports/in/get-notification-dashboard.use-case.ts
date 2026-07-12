import { UserId } from "../../../../user/domain/model/user-id.vo";
import { DashboardPeriod } from "../../enums/dashboard-period.enum";

export interface NotificationDashboardResult {
  period: DashboardPeriod;
  startDate: Date;
  endDate: Date;
  overview: {
    total: number;
    read: number;
    unread: number;
  };
  dailyTrend: { date: string; count: number }[];
  byCategory: { category: string; count: number }[];
  recentUnread: {
    id: string;
    title: string;
    category: string;
    createdAt: Date;
  }[];
}

export interface GetNotificationDashboardUseCase {
  invoke(
    owner: UserId,
    period: DashboardPeriod,
    date: Date,
  ): Promise<NotificationDashboardResult>;
}
