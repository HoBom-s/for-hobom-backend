import { UserId } from "../../../../user/domain/model/user-id.vo";

export interface NoteDashboardResult {
  overview: {
    total: number;
    checklistCompletionRate: number;
  };
  byStatus: { status: string; count: number }[];
  byType: { type: string; count: number }[];
  byLabel: { labelId: string; count: number }[];
  dailyCreated: { date: string; count: number }[];
}

export interface GetNoteDashboardUseCase {
  invoke(owner: UserId): Promise<NoteDashboardResult>;
}
