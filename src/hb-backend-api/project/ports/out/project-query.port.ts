import { ProjectDocument } from "../../domain/model/project.schema";
import { ProjectId } from "../../domain/model/project-id.vo";
import { ProjectKey } from "../../domain/model/project-key.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

export interface ProjectQueryPort {
  findById(id: ProjectId): Promise<ProjectDocument>;
  findByKey(key: ProjectKey): Promise<ProjectDocument | null>;
  findByOwner(owner: UserId): Promise<ProjectDocument[]>;
  findByMember(userId: UserId): Promise<ProjectDocument[]>;
}
