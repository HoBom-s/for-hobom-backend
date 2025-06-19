import { Inject, Injectable } from "@nestjs/common";
import { OutboxQueryPort } from "../../../application/ports/out/outbox-query.port";
import { DIToken } from "../../../../../shared/di/token.di";
import { OutboxRepository } from "../../../infra/repositories/outbox.repository";
import { EventType } from "../../../domain/enum/event-type.enum";
import { OutboxStatus } from "../../../domain/enum/outbox-status.enum";
import { FindOutboxEntity } from "../../../domain/entity/find-outbox.entity";
import { OutboxDocument } from "../../../domain/entity/outbox.schema";
import type { TodayMenuPayload } from "../../../domain/factories/today-menu.payload";
import { OutboxId } from "../../../domain/vo/outbox-id.vo";

@Injectable()
export class OutboxQueryAdapter implements OutboxQueryPort {
  constructor(
    @Inject(DIToken.OutboxModule.OutboxRepository)
    private readonly outboxRepository: OutboxRepository,
  ) {}

  public async findByEventTypeAndStatus(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<FindOutboxEntity[]> {
    const outboxResults = await this.findBy(eventType, status);
    return this.toResult(outboxResults);
  }

  private async findBy(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<OutboxDocument[]> {
    return await this.outboxRepository.findByEventTypeAndStatus(
      eventType,
      status,
    );
  }

  private toResult(outboxResults: OutboxDocument[]): FindOutboxEntity[] {
    return outboxResults.map((item) =>
      FindOutboxEntity.of({
        id: OutboxId.fromString(String(item._id)),
        eventId: item.eventId,
        eventType: item.eventType,
        payload: item.payload as TodayMenuPayload,
        status: item.status,
        retryCount: item.retryCount,
        sentAt: item.sentAt,
        failedAt: item.failedAt,
        lastError: item.lastError,
        version: item.version,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }),
    );
  }
}
