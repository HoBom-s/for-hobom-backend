import { SprintId } from "../../domain/model/sprint-id.vo";

export interface UpdateSprintUseCase {
  invoke(
    id: SprintId,
    name: string,
    goal: string | null,
    startDate: Date,
    endDate: Date,
  ): Promise<void>;
}
