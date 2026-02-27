import { SystemDashboardPeriod } from "../../enums/dashboard-period.enum";

export interface SystemDashboardResult {
  period: SystemDashboardPeriod;
  startDate: Date;
  endDate: Date;
  overview: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
    successRate: number;
  };
  byEventType: { eventType: string; count: number }[];
  hourlyThroughput: { hour: number; count: number }[];
  recentFailures: {
    eventId: string;
    eventType: string;
    lastError: string | null;
    retryCount: number;
    failedAt: Date | null;
  }[];
  retryDistribution: { retryCount: number; count: number }[];
}

export interface GetSystemDashboardUseCase {
  invoke(period: SystemDashboardPeriod): Promise<SystemDashboardResult>;
}
