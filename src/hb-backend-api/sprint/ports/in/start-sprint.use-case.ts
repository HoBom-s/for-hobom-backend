import { SprintId } from "../../domain/model/sprint-id.vo";

export interface StartSprintUseCase {
  invoke(id: SprintId): Promise<void>;
}
