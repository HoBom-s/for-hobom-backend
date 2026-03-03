import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { ProjectLabelId } from "../../domain/model/project-label-id.vo";
import { CreateProjectLabelEntity } from "../../domain/model/project-label.entity";

export interface ProjectLabelPersistencePort {
  save(entity: CreateProjectLabelEntity): Promise<void>;
  update(id: ProjectLabelId, data: Record<string, unknown>): Promise<void>;
  deleteOne(id: ProjectLabelId): Promise<void>;
  deleteByProject(projectId: ProjectId): Promise<void>;
}
