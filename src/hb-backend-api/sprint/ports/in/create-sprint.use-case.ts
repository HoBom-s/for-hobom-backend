import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

export interface CreateSprintUseCase {
  invoke(
    projectId: ProjectId,
    name: string,
    goal: string | null,
    startDate: Date,
    endDate: Date,
    createdBy: UserId,
  ): Promise<void>;
}
