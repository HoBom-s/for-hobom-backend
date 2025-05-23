import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";
import { UserId } from "../../../../user/domain/vo/user-id.vo";
import { DailyTodoWithRelationQueryResult } from "../../result/daily-todo-query.result";

export interface GetDailyTodoUseCase {
  invoke(
    id: DailyTodoId,
    owner: UserId,
  ): Promise<DailyTodoWithRelationQueryResult>;
}
