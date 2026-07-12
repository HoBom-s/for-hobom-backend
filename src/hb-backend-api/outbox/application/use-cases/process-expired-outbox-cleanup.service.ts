import { Inject, Injectable, Logger } from "@nestjs/common";
import { ProcessExpiredOutboxCleanupUseCase } from "../../domain/ports/in/process-expired-outbox-cleanup.use-case";
import { OutboxPersistencePort } from "../../domain/ports/out/outbox-persistence.port";
import { DIToken } from "../../../../shared/di/token.di";

@Injectable()
export class ProcessExpiredOutboxCleanupService implements ProcessExpiredOutboxCleanupUseCase {
  private static readonly BATCH_SIZE = 100;
  private static readonly RETENTION_DAYS = 30;
  private readonly logger = new Logger(ProcessExpiredOutboxCleanupService.name);

  constructor(
    @Inject(DIToken.OutboxModule.OutboxPersistencePort)
    private readonly outboxPersistencePort: OutboxPersistencePort,
  ) {}

  public async invoke(): Promise<void> {
    const olderThan = new Date();
    olderThan.setDate(
      olderThan.getDate() - ProcessExpiredOutboxCleanupService.RETENTION_DAYS,
    );

    let totalDeleted = 0;
    let deleted = 0;

    do {
      deleted = await this.outboxPersistencePort.deleteExpiredBatch(
        olderThan,
        ProcessExpiredOutboxCleanupService.BATCH_SIZE,
      );
      totalDeleted += deleted;
    } while (deleted === ProcessExpiredOutboxCleanupService.BATCH_SIZE);

    if (totalDeleted > 0) {
      this.logger.log(`만료된 outbox ${totalDeleted}건 삭제 완료`);
    }
  }
}
