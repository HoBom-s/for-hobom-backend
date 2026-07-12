import { UserId } from "../../../../user/domain/model/user-id.vo";

export interface FutureMessageDashboardResult {
  overview: {
    total: number;
    pending: number;
    sent: number;
  };
  upcoming: {
    id: string;
    title: string;
    recipientId: string;
    scheduledAt: string;
  }[];
  monthlyTrend: { month: string; count: number }[];
}

export interface GetFutureMessageDashboardUseCase {
  invoke(senderId: UserId): Promise<FutureMessageDashboardResult>;
}
