import { Inject, Injectable } from "@nestjs/common";
import { OutboxPersistencePort } from "../../../application/ports/out/outbox-persistence.port";
import { OutboxRepository } from "../../../infra/outbox.repository";
import { CreateOutboxEntity } from "../../../domain/entity/create-outbox.entity";
import { DIToken } from "../../../../../shared/di/token.di";

@Injectable()
export class OutboxPersistenceAdapter implements OutboxPersistencePort {
  constructor(
    @Inject(DIToken.OutboxModule.OutboxRepository)
    private readonly outboxRepository: OutboxRepository,
  ) {}

  public async save(entity: CreateOutboxEntity): Promise<void> {
    await this.saveEntity(entity);
  }

  private async saveEntity(entity: CreateOutboxEntity): Promise<void> {
    await this.outboxRepository.save(entity);
  }
}
