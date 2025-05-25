import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";
import { UserId } from "../../../../user/domain/vo/user-id.vo";
import { UpdateDailyTodoCompleteStatusCommand } from "../../command/update-daily-todo-complete-status.command";

export interface UpdateDailyTodoCompleteStatusUseCase {
  invoke(
    id: DailyTodoId,
    owner: UserId,
    command: UpdateDailyTodoCompleteStatusCommand,
  ): Promise<void>;
}
