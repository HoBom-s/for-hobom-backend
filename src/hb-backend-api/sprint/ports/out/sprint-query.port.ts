import { SprintDocument } from "../../domain/model/sprint.schema";
import { SprintId } from "../../domain/model/sprint-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

export interface SprintQueryPort {
  findById(id: SprintId): Promise<SprintDocument>;
  findByProject(projectId: ProjectId): Promise<SprintDocument[]>;
  findActiveSprint(projectId: ProjectId): Promise<SprintDocument | null>;
}
