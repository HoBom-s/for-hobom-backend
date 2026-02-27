import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { UpdateDailyTodoCommand } from "../../command/update-daily-todo.command";

export interface UpdateDailyTodoUseCase {
  invoke(
    id: DailyTodoId,
    owner: UserId,
    command: UpdateDailyTodoCommand,
  ): Promise<void>;
}
