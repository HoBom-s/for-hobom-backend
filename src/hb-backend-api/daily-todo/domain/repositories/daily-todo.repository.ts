import { DailyTodoCreateEntitySchema } from "../entity/daily-todo.entity";
import { UserId } from "../../../user/domain/vo/user-id.vo";
import type { DailyTodoWithRelations } from "../entity/daily-todo.retations";
import { YearMonthDayString } from "../vo/year-month-day-string.vo";
import { DailyTodoId } from "../vo/daily-todo-id.vo";

export interface DailyTodoRepository {
  save(dailyTodoCreateSchemaEntity: DailyTodoCreateEntitySchema): Promise<void>;

  findAll(
    owner: UserId,
    date: YearMonthDayString,
  ): Promise<DailyTodoWithRelations[]>;

  findById(
    id: DailyTodoId,
    owner: UserId,
  ): Promise<DailyTodoWithRelations | null>;
}
