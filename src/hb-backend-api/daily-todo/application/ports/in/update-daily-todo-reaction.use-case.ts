import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";
import { UserId } from "../../../../user/domain/vo/user-id.vo";
import { UpdateDailyTodoReactionCommand } from "../../command/update-daily-todo-reaction.command";

export interface UpdateDailyTodoReactionUseCase {
  invoke(
    id: DailyTodoId,
    owner: UserId,
    command: UpdateDailyTodoReactionCommand,
  ): Promise<void>;
}
