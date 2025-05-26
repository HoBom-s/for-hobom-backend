import { DailyTodoCreateEntitySchema } from "../../../domain/entity/daily-todo.entity";
import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";
import { UserId } from "../../../../user/domain/vo/user-id.vo";
import { DailyTodoCompleteStatus } from "../../../domain/enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "../../../domain/enums/daily-todo-cycle.enum";
import { Reaction } from "../../../domain/entity/daily-todo.retations";

export interface DailyTodoPersistencePort {
  save(dailyTodoCreateEntitySchema: DailyTodoCreateEntitySchema): Promise<void>;

  updateDailyTodoCompleteStatus(
    id: DailyTodoId,
    owner: UserId,
    progress: DailyTodoCompleteStatus,
  ): Promise<void>;

  updateDailyTodoCycle(
    id: DailyTodoId,
    owner: UserId,
    cycle: DailyTodoCycle,
  ): Promise<void>;

  updateDailyTodoReaction(
    id: DailyTodoId,
    owner: UserId,
    reaction: Reaction,
  ): Promise<void>;
}
