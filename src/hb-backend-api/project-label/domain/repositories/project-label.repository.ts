import { CreateProjectLabelEntity } from "../model/project-label.entity";
import { ProjectLabelDocument } from "../model/project-label.schema";
import { ProjectLabelId } from "../model/project-label-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

export interface ProjectLabelRepository {
  save(entity: CreateProjectLabelEntity): Promise<void>;
  findByProject(projectId: ProjectId): Promise<ProjectLabelDocument[]>;
  findById(id: ProjectLabelId): Promise<ProjectLabelDocument>;
  update(id: ProjectLabelId, data: Record<string, unknown>): Promise<void>;
  deleteOne(id: ProjectLabelId): Promise<void>;
}
