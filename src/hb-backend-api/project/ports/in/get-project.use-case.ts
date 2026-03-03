import { ProjectDocument } from "../../domain/model/project.schema";
import { ProjectId } from "../../domain/model/project-id.vo";

export interface GetProjectUseCase {
  invoke(id: ProjectId): Promise<ProjectDocument>;
}
