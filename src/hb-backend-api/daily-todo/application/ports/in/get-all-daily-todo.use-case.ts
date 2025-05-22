import { UserId } from "../../../../user/domain/vo/user-id.vo";
import { DailyTodoWithRelationQueryResult } from "../out/daily-todo-query.result";

export interface GetAllDailyTodoUseCase {
  invoke(owner: UserId): Promise<DailyTodoWithRelationQueryResult[]>;
}
