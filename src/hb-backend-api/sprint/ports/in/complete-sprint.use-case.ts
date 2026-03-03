import { SprintId } from "../../domain/model/sprint-id.vo";

export interface CompleteSprintUseCase {
  invoke(id: SprintId): Promise<void>;
}
