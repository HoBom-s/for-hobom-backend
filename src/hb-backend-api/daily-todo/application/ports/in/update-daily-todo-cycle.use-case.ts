import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";
import { UserId } from "../../../../user/domain/vo/user-id.vo";
import { UpdateDailyTodoCycleCommand } from "../../command/update-daily-todo-cycle.command";

export interface UpdateDailyTodoCycleUseCase {
  invoke(
    id: DailyTodoId,
    owner: UserId,
    command: UpdateDailyTodoCycleCommand,
  ): Promise<void>;
}
