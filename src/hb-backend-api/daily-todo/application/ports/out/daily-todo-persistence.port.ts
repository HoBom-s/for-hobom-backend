import { DailyTodoCreateEntitySchema } from "../../../domain/entity/daily-todo.entity";
import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { DailyTodoCompleteStatus } from "../../../domain/enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "../../../domain/enums/daily-todo-cycle.enum";
import { Reaction } from "../../../domain/entity/daily-todo.retations";
import { CategoryId } from "../../../../category/domain/model/category-id.vo";

export interface DailyTodoPersistencePort {
  save(dailyTodoCreateEntitySchema: DailyTodoCreateEntitySchema): Promise<void>;

  saveAll(entities: DailyTodoCreateEntitySchema[]): Promise<void>;

  findByDateRangeAndCycles(
    startDate: Date,
    endDate: Date,
    cycles: DailyTodoCycle[],
  ): Promise<
    {
      title: string;
      owner: UserId;
      category: CategoryId;
      cycle: DailyTodoCycle;
    }[]
  >;

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

  update(
    id: DailyTodoId,
    owner: UserId,
    data: Record<string, unknown>,
  ): Promise<void>;

  deleteDailyTodoById(id: DailyTodoId, owner: UserId): Promise<void>;
}
