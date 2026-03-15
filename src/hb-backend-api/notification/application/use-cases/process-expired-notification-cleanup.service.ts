import { Inject, Injectable, Logger } from "@nestjs/common";
import { ProcessExpiredNotificationCleanupUseCase } from "../../domain/ports/in/process-expired-notification-cleanup.use-case";
import { NotificationPersistencePort } from "../../domain/ports/out/notification-persistence.port";
import { DIToken } from "../../../../shared/di/token.di";

@Injectable()
export class ProcessExpiredNotificationCleanupService implements ProcessExpiredNotificationCleanupUseCase {
  private static readonly BATCH_SIZE = 100;
  private static readonly RETENTION_DAYS = 30;
  private readonly logger = new Logger(
    ProcessExpiredNotificationCleanupService.name,
  );

  constructor(
    @Inject(DIToken.NotificationModule.NotificationPersistencePort)
    private readonly notificationPersistencePort: NotificationPersistencePort,
  ) {}

  public async invoke(): Promise<void> {
    const olderThan = new Date();
    olderThan.setDate(
      olderThan.getDate() -
        ProcessExpiredNotificationCleanupService.RETENTION_DAYS,
    );

    let totalDeleted = 0;
    let deleted = 0;

    do {
      deleted = await this.notificationPersistencePort.deleteExpiredBatch(
        olderThan,
        ProcessExpiredNotificationCleanupService.BATCH_SIZE,
      );
      totalDeleted += deleted;
    } while (deleted === ProcessExpiredNotificationCleanupService.BATCH_SIZE);

    if (totalDeleted > 0) {
      this.logger.log(`만료된 알림 ${totalDeleted}건 삭제 완료`);
    }
  }
}
