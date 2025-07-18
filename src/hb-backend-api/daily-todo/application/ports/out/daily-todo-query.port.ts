import { UserId } from "../../../../user/domain/model/user-id.vo";
import { DailyTodoWithRelationEntity } from "../../../domain/entity/daily-todo.retations";
import { YearMonthDayString } from "../../../domain/vo/year-month-day-string.vo";
import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";

export interface DailyTodoQueryPort {
  findAll(
    owner: UserId,
    date: YearMonthDayString,
  ): Promise<DailyTodoWithRelationEntity[]>;

  findById(
    id: DailyTodoId,
    owner: UserId,
  ): Promise<DailyTodoWithRelationEntity>;

  findByDate(
    owner: UserId,
    date: YearMonthDayString,
  ): Promise<DailyTodoWithRelationEntity[]>;
}
