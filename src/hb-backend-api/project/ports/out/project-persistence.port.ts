import { CreateProjectEntity } from "../../domain/model/project.entity";
import { ProjectId } from "../../domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { MemberRole } from "../../domain/enums/member-role.enum";

export interface ProjectPersistencePort {
  save(entity: CreateProjectEntity): Promise<void>;
  update(id: ProjectId, data: Record<string, unknown>): Promise<void>;
  incrementIssueSequence(id: ProjectId): Promise<number>;
  addMember(id: ProjectId, userId: UserId, role: MemberRole): Promise<void>;
  removeMember(id: ProjectId, userId: UserId): Promise<void>;
  deleteOne(id: ProjectId): Promise<void>;
}
