import { Inject, Injectable } from "@nestjs/common";
import { RegisterJob } from "../../../../shared/adapters/in/job/job-metadata.decorator";
import { CronExpression } from "../../../../shared/constants/cron-expression.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { ProcessDailyTodoRecurrenceUseCase } from "../../domain/ports/in/process-daily-todo-recurrence.use-case";

@Injectable()
@RegisterJob({
  name: "process-daily-todo-recurrence-scheduler",
  cron: CronExpression.DAILY_6AM,
})
export class ProcessDailyTodoRecurrenceScheduler {
  constructor(
    @Inject(DIToken.DailyTodoModule.ProcessDailyTodoRecurrenceUseCase)
    private readonly processDailyTodoRecurrenceUseCase: ProcessDailyTodoRecurrenceUseCase,
  ) {}

  public async process() {
    await this.processDailyTodoRecurrenceUseCase.invoke();
  }
}
