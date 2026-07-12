import { ProjectLabelDocument } from "../../domain/model/project-label.schema";
import { ProjectLabelId } from "../../domain/model/project-label-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

export interface ProjectLabelQueryPort {
  findByProject(projectId: ProjectId): Promise<ProjectLabelDocument[]>;
  findById(id: ProjectLabelId): Promise<ProjectLabelDocument>;
}
