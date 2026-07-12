import { UserId } from "../../../../user/domain/model/user-id.vo";
import { DashboardPeriod } from "../../enums/dashboard-period.enum";

export interface ActivityDashboardResult {
  period: DashboardPeriod;
  startDate: Date;
  endDate: Date;
  overview: {
    activeDays: number;
    totalDays: number;
    activityRate: number;
    currentStreak: number;
    longestStreak: number;
  };
  heatmap: {
    date: string;
    count: number;
    level: number;
  }[];
  moduleUsage: {
    module: string;
    count: number;
    percentage: number;
  }[];
}

export interface GetActivityDashboardUseCase {
  invoke(
    owner: UserId,
    period: DashboardPeriod,
    date: Date,
  ): Promise<ActivityDashboardResult>;
}
