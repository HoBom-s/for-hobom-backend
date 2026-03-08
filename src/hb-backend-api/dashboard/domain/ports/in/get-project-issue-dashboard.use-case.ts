import { ProjectId } from "../../../../project/domain/model/project-id.vo";

export interface ProjectIssueDashboardResult {
  overview: {
    total: number;
    open: number;
    done: number;
    completionRate: number;
    overdueCount: number;
  };
  byStatus: { statusId: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  byType: { type: string; count: number }[];
}

export interface GetProjectIssueDashboardUseCase {
  invoke(projectId: ProjectId): Promise<ProjectIssueDashboardResult>;
}
