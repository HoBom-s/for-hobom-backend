import { Inject, Injectable } from "@nestjs/common";
import { DIToken } from "../../../../shared/di/token.di";
import { ProcessScheduleFutureMessageUseCase } from "../../domain/ports/in/process-schedule-future-message.use-case";
import { CronExpression } from "../../../../shared/constants/cron-expression.constant";
import { RegisterJob } from "../../../../shared/adpaters/in/job/job-metadata.decorator";

@Injectable()
@RegisterJob({
  name: "process-future-message-scheduler",
  cron: CronExpression.DAILY_9AM,
})
export class ProcessFutureMessageScheduler {
  constructor(
    @Inject(DIToken.FutureMessageModule.ProcessScheduleFutureMessageUseCase)
    private readonly processScheduleFutureMessageUseCase: ProcessScheduleFutureMessageUseCase,
  ) {}

  public async process() {
    await this.processScheduleFutureMessageUseCase.invoke();
  }
}
