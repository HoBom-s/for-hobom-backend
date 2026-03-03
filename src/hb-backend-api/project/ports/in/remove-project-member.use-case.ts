import { ProjectId } from "../../domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

export interface RemoveProjectMemberUseCase {
  invoke(projectId: ProjectId, userId: UserId): Promise<void>;
}
