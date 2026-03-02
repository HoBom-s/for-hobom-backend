import { CreateProjectEntity } from "../model/project.entity";
import { ProjectDocument } from "../model/project.schema";
import { ProjectId } from "../model/project-id.vo";
import { ProjectKey } from "../model/project-key.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { MemberRole } from "../enums/member-role.enum";

export interface ProjectRepository {
  save(entity: CreateProjectEntity): Promise<void>;
  findById(id: ProjectId): Promise<ProjectDocument>;
  findByKey(key: ProjectKey): Promise<ProjectDocument | null>;
  findByOwner(owner: UserId): Promise<ProjectDocument[]>;
  findByMember(userId: UserId): Promise<ProjectDocument[]>;
  update(id: ProjectId, data: Record<string, unknown>): Promise<void>;
  incrementIssueSequence(id: ProjectId): Promise<number>;
  addMember(id: ProjectId, userId: UserId, role: MemberRole): Promise<void>;
  removeMember(id: ProjectId, userId: UserId): Promise<void>;
  deleteOne(id: ProjectId): Promise<void>;
}
