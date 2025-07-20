import { Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { DIToken } from "../../../../shared/di/token.di";
import { ProcessScheduleFutureMessageUseCase } from "../../domain/ports/in/process-schedule-future-message.use-case";
import { CronExpression } from "../../../../shared/constants/cron-expression.constant";

@Injectable()
export class ProcessFutureMessageScheduler {
  constructor(
    @Inject(DIToken.FutureMessageModule.ProcessScheduleFutureMessageUseCase)
    private readonly processScheduleFutureMessageUseCase: ProcessScheduleFutureMessageUseCase,
  ) {}

  @Cron(CronExpression.DAILY_9AM)
  public async process() {
    await this.processScheduleFutureMessageUseCase.invoke();
  }
}
