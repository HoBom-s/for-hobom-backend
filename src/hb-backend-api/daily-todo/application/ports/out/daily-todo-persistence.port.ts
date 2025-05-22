import { DailyTodoCreateEntitySchema } from "../../../domain/entity/daily-todo.entity";

export interface DailyTodoPersistencePort {
  save(dailyTodoCreateEntitySchema: DailyTodoCreateEntitySchema): Promise<void>;
}
