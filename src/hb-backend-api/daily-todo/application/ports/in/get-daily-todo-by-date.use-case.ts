import { UserId } from "../../../../user/domain/model/user-id.vo";
import { YearMonthDayString } from "../../../domain/vo/year-month-day-string.vo";
import { DailyTodoWithRelationQueryResult } from "../../result/daily-todo-query.result";

export interface GetDailyTodoByDateUseCase {
  invoke(
    owner: UserId,
    date: YearMonthDayString,
  ): Promise<DailyTodoWithRelationQueryResult[]>;
}
