import { Inject, Injectable } from "@nestjs/common";
import { OutboxQueryPort } from "../../domain/ports/out/outbox-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { OutboxRepository } from "../../infra/repositories/outbox.repository";
import { EventType } from "../../domain/model/event-type.enum";
import { OutboxStatus } from "../../domain/model/outbox-status.enum";
import { FindOutboxEntity } from "../../domain/model/find-outbox.entity";
import { OutboxDocument } from "../../domain/model/outbox.schema";
import { OutboxId } from "../../domain/model/outbox-id.vo";
import {
  payloadCaster,
  PayloadMap,
} from "../../domain/model/outbox-payload.parser";

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
    return outboxResults.map((item) => {
      const parsedPayload = this.parsePayload(item.eventType, item.payload);
      return FindOutboxEntity.of({
        id: OutboxId.fromString(String(item._id)),
        eventId: item.eventId,
        eventType: item.eventType,
        payload: parsedPayload,
        status: item.status,
        retryCount: item.retryCount,
        sentAt: item.sentAt,
        failedAt: item.failedAt,
        lastError: item.lastError,
        version: item.version,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    });
  }

  private parsePayload<T extends keyof PayloadMap>(
    eventType: T,
    payload: unknown,
  ): PayloadMap[T] {
    return payloadCaster[eventType](payload);
  }
}
