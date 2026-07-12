import { SprintId } from "../../domain/model/sprint-id.vo";

export interface DeleteSprintUseCase {
  invoke(id: SprintId): Promise<void>;
}
