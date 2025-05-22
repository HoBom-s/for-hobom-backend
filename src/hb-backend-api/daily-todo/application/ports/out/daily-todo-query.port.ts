import { UserId } from "../../../../user/domain/vo/user-id.vo";
import { DailyTodoWithRelationEntity } from "../../../domain/entity/daily-todo.retations";
import { YearMonthDayString } from "../../../domain/vo/year-month-day-string.vo";

export interface DailyTodoQueryPort {
  findAll(
    owner: UserId,
    date: YearMonthDayString,
  ): Promise<DailyTodoWithRelationEntity[]>;
}
