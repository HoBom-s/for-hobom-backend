import { UserId } from "../../../../user/domain/vo/user-id.vo";
import { DailyTodoWithRelationQueryResult } from "../../result/daily-todo-query.result";
import { YearMonthDayString } from "../../../domain/vo/year-month-day-string.vo";

export interface GetAllDailyTodoUseCase {
  invoke(
    owner: UserId,
    date: YearMonthDayString,
  ): Promise<DailyTodoWithRelationQueryResult[]>;
}
