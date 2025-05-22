import { CreateDailyTodoCommand } from "../../command/create-daily-todo.command";
import { UserId } from "../../../../user/domain/vo/user-id.vo";

export interface CreateDailyTodoUseCase {
  invoke(command: CreateDailyTodoCommand, owner: UserId): Promise<void>;
}
