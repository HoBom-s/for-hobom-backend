import { ProjectLabelDocument } from "../../domain/model/project-label.schema";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

export interface GetProjectLabelsUseCase {
  invoke(projectId: ProjectId): Promise<ProjectLabelDocument[]>;
}
