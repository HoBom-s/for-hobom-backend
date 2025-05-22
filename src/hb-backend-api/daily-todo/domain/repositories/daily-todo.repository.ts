import { DailyTodoCreateEntitySchema } from "../entity/daily-todo.entity";

export interface DailyTodoRepository {
  save(dailyTodoCreateSchemaEntity: DailyTodoCreateEntitySchema): Promise<void>;
}
