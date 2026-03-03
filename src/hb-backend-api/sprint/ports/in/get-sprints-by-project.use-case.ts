import { SprintDocument } from "../../domain/model/sprint.schema";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

export interface GetSprintsByProjectUseCase {
  invoke(projectId: ProjectId): Promise<SprintDocument[]>;
}
