import { Types } from "mongoose";
import { ProjectId } from "../../../../project/domain/model/project-id.vo";

export interface SprintDashboardResult {
  sprint: {
    id: string;
    name: string;
    goal: string | null;
    status: string;
    startDate: Date;
    endDate: Date;
  };
  overview: {
    totalIssues: number;
    completedIssues: number;
    completionRate: number;
    totalStoryPoints: number;
    completedStoryPoints: number;
  };
}

export interface GetSprintDashboardUseCase {
  invoke(
    projectId: ProjectId,
    sprintId: Types.ObjectId,
  ): Promise<SprintDashboardResult>;
}
