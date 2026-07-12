import { CreateSprintEntity } from "../model/sprint.entity";
import { SprintDocument } from "../model/sprint.schema";
import { SprintId } from "../model/sprint-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

export interface SprintRepository {
  save(entity: CreateSprintEntity): Promise<void>;
  findById(id: SprintId): Promise<SprintDocument>;
  findByProject(projectId: ProjectId): Promise<SprintDocument[]>;
  findActiveSprint(projectId: ProjectId): Promise<SprintDocument | null>;
  update(id: SprintId, data: Record<string, unknown>): Promise<void>;
  deleteOne(id: SprintId): Promise<void>;
  deleteByProject(projectId: ProjectId): Promise<void>;
}
