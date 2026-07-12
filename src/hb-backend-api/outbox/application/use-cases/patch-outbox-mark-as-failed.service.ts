import { Inject, Injectable } from "@nestjs/common";
import { PatchOutboxMarkAsFailedUseCase } from "../../domain/ports/in/patch-outbox-mark-as-failed.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { EventId } from "../../domain/model/event-id.vo";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { OutboxPersistencePort } from "../../domain/ports/out/outbox-persistence.port";

@Injectable()
export class PatchOutboxMarkAsFailedService implements PatchOutboxMarkAsFailedUseCase {
  constructor(
    @Inject(DIToken.OutboxModule.OutboxPersistencePort)
    private readonly outboxPersistencePort: OutboxPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(eventId: EventId, errorMessage: string): Promise<void> {
    await this.outboxPersistencePort.markAsFailed(eventId, errorMessage);
  }
}
