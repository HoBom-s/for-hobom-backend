import { Inject, Injectable } from "@nestjs/common";
import { OutboxPersistencePort } from "../../../application/ports/out/outbox-persistence.port";
import { OutboxRepository } from "../../../infra/repositories/outbox.repository";
import { CreateOutboxEntity } from "../../../domain/entity/create-outbox.entity";
import { DIToken } from "../../../../../shared/di/token.di";
import { EventId } from "src/hb-backend-api/outbox/domain/vo/event-id.vo";

@Injectable()
export class OutboxPersistenceAdapter implements OutboxPersistencePort {
  constructor(
    @Inject(DIToken.OutboxModule.OutboxRepository)
    private readonly outboxRepository: OutboxRepository,
  ) {}

  public async save(entity: CreateOutboxEntity): Promise<void> {
    await this.saveEntity(entity);
  }

  public async markAsSent(eventId: EventId): Promise<void> {
    await this.updateBySent(eventId);
  }

  public async markAsFailed(
    eventId: EventId,
    errorMessage: string,
  ): Promise<void> {
    await this.updateByFailed(eventId, errorMessage);
  }

  private async saveEntity(entity: CreateOutboxEntity): Promise<void> {
    await this.outboxRepository.save(entity);
  }

  private async updateBySent(eventId: EventId): Promise<void> {
    await this.outboxRepository.markAsSent(eventId);
  }

  private async updateByFailed(
    eventId: EventId,
    errorMessage: string,
  ): Promise<void> {
    await this.outboxRepository.markAsFailed(eventId, errorMessage);
  }
}
