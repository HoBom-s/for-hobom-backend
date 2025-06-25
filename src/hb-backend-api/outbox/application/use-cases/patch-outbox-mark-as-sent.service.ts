import { Inject, Injectable } from "@nestjs/common";
import { PatchOutboxMarkAsSentUseCase } from "../ports/in/patch-outbox-mark-as-sent.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { EventId } from "../../domain/vo/event-id.vo";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { OutboxPersistencePort } from "../ports/out/outbox-persistence.port";

@Injectable()
export class PatchOutboxMarkAsSentService
  implements PatchOutboxMarkAsSentUseCase
{
  constructor(
    @Inject(DIToken.OutboxModule.OutboxPersistencePort)
    private readonly outboxPersistencePort: OutboxPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(eventId: EventId): Promise<void> {
    await this.markAsSent(eventId);
  }

  private async markAsSent(eventId: EventId): Promise<void> {
    await this.outboxPersistencePort.markAsSent(eventId);
  }
}
