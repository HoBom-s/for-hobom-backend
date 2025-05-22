import { DailyTodoCreateEntitySchema } from "../entity/daily-todo.entity";
import { UserId } from "../../../user/domain/vo/user-id.vo";
import type { DailyTodoWithRelations } from "../entity/daily-todo.retations";

export interface DailyTodoRepository {
  save(dailyTodoCreateSchemaEntity: DailyTodoCreateEntitySchema): Promise<void>;

  findAll(owner: UserId): Promise<DailyTodoWithRelations[]>;
}
