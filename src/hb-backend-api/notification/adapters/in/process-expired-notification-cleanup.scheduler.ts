import { Inject, Injectable } from "@nestjs/common";
import { RegisterJob } from "../../../../shared/adapters/in/job/job-metadata.decorator";
import { CronExpression } from "../../../../shared/constants/cron-expression.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { ProcessExpiredNotificationCleanupUseCase } from "../../domain/ports/in/process-expired-notification-cleanup.use-case";

@Injectable()
@RegisterJob({
  name: "process-expired-notification-cleanup",
  cron: CronExpression.DAILY_3AM,
})
export class ProcessExpiredNotificationCleanupScheduler {
  constructor(
    @Inject(DIToken.NotificationModule.ProcessExpiredNotificationCleanupUseCase)
    private readonly processExpiredNotificationCleanupUseCase: ProcessExpiredNotificationCleanupUseCase,
  ) {}

  public async process() {
    await this.processExpiredNotificationCleanupUseCase.invoke();
  }
}
