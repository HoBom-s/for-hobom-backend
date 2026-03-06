import { Inject, Injectable } from "@nestjs/common";
import { RegisterJob } from "../../../../shared/adapters/in/job/job-metadata.decorator";
import { CronExpression } from "../../../../shared/constants/cron-expression.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { ProcessExpiredOutboxCleanupUseCase } from "../../domain/ports/in/process-expired-outbox-cleanup.use-case";

@Injectable()
@RegisterJob({
  name: "process-expired-outbox-cleanup",
  cron: CronExpression.DAILY_3AM,
})
export class ProcessExpiredOutboxCleanupScheduler {
  constructor(
    @Inject(DIToken.OutboxModule.ProcessExpiredOutboxCleanupUseCase)
    private readonly processExpiredOutboxCleanupUseCase: ProcessExpiredOutboxCleanupUseCase,
  ) {}

  public async process() {
    await this.processExpiredOutboxCleanupUseCase.invoke();
  }
}
