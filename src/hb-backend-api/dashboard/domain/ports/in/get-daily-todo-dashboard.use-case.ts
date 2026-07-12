import { UserId } from "../../../../user/domain/model/user-id.vo";
import { DashboardPeriod } from "../../enums/dashboard-period.enum";

export interface DailyTodoDashboardResult {
  period: DashboardPeriod;
  startDate: Date;
  endDate: Date;
  overview: {
    total: number;
    completed: number;
    completionRate: number;
    reactionsCount: number;
  };
  daily: {
    date: string;
    total: number;
    completed: number;
    completionRate: number;
  }[];
  byCategory: {
    categoryId: string;
    categoryTitle: string;
    total: number;
    completed: number;
  }[];
  byCycle: {
    cycle: string;
    total: number;
    completed: number;
  }[];
}

export interface GetDailyTodoDashboardUseCase {
  invoke(
    owner: UserId,
    period: DashboardPeriod,
    date: Date,
  ): Promise<DailyTodoDashboardResult>;
}
