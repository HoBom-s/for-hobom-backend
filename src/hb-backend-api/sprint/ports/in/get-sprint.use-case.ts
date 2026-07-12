import { SprintDocument } from "../../domain/model/sprint.schema";
import { SprintId } from "../../domain/model/sprint-id.vo";

export interface GetSprintUseCase {
  invoke(id: SprintId): Promise<SprintDocument>;
}
