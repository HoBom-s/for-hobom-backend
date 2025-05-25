import { DailyTodoCompleteStatus } from "../../domain/enums/daily-todo-complete-status.enum";

export class UpdateDailyTodoCompleteStatusCommand {
  constructor(private readonly progress: DailyTodoCompleteStatus) {
    this.progress = progress;
  }

  public static of(
    progress: DailyTodoCompleteStatus,
  ): UpdateDailyTodoCompleteStatusCommand {
    return new UpdateDailyTodoCompleteStatusCommand(progress);
  }

  public get getStatus(): DailyTodoCompleteStatus {
    return this.progress;
  }
}
