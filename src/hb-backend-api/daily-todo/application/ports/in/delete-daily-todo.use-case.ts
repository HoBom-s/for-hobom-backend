import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";
import { UserId } from "../../../../user/domain/vo/user-id.vo";

export interface DeleteDailyTodoUseCase {
  invoke(id: DailyTodoId, owner: UserId): Promise<void>;
}
