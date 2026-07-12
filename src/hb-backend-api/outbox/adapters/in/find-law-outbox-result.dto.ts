import { EventType } from "../../domain/model/event-type.enum";
import { OutboxStatus } from "../../domain/model/outbox-status.enum";
import { LawChangedPayload } from "../../domain/model/law-changed.payload";
import { FindOutboxLawQueryResult } from "../../domain/ports/out/find-outbox-law-query.result";

export class FindLawOutboxResultDto {
  constructor(
    readonly id: string,
    readonly eventId: string,
    readonly eventType: EventType,
    readonly payload: LawChangedPayload,
    readonly status: OutboxStatus,
    readonly retryCount: number,
    readonly sentAt: Date | null,
    readonly failedAt: Date | null,
    readonly lastError: string | null,
    readonly version: number,
    readonly createdAt: Date | null,
    readonly updatedAt: Date | null,
  ) {
    this.id = id;
    this.eventId = eventId;
    this.eventType = eventType;
    this.payload = payload;
    this.status = status;
    this.retryCount = retryCount;
    this.sentAt = sentAt;
    this.failedAt = failedAt;
    this.lastError = lastError;
    this.version = version;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static from(params: FindOutboxLawQueryResult) {
    return new FindLawOutboxResultDto(
      params.getId.toString(),
      params.getEventId,
      params.getEventType,
      params.getPayload,
      params.getStatus,
      params.getRetryCount,
      params.getSentAt,
      params.getFailedAt,
      params.getLastError,
      params.getVersion,
      params.getCreatedAt,
      params.getUpdatedAt,
    );
  }
}
