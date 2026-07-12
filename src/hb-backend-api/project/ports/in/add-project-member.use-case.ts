import { ProjectId } from "../../domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { MemberRole } from "../../domain/enums/member-role.enum";

export interface AddProjectMemberUseCase {
  invoke(projectId: ProjectId, userId: UserId, role: MemberRole): Promise<void>;
}
