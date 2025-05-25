import { DailyTodoCycle } from "../../domain/enums/daily-todo-cycle.enum";

export class UpdateDailyTodoCycleCommand {
  constructor(private readonly cycle: DailyTodoCycle) {
    this.cycle = cycle;
  }

  public static of(cycle: DailyTodoCycle): UpdateDailyTodoCycleCommand {
    return new UpdateDailyTodoCycleCommand(cycle);
  }

  public get getCycle(): DailyTodoCycle {
    return this.cycle;
  }
}
