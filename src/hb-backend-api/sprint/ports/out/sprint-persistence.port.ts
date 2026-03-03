import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { CreateSprintEntity } from "../../domain/model/sprint.entity";
import { SprintId } from "../../domain/model/sprint-id.vo";

export interface SprintPersistencePort {
  save(entity: CreateSprintEntity): Promise<void>;
  update(id: SprintId, data: Record<string, unknown>): Promise<void>;
  deleteOne(id: SprintId): Promise<void>;
  deleteByProject(projectId: ProjectId): Promise<void>;
}
