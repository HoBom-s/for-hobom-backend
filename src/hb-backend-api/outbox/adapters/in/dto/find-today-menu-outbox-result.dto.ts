import { EventType } from "../../../domain/enum/event-type.enum";
import type { TodayMenuPayload } from "../../../domain/factories/today-menu.payload";
import { OutboxStatus } from "../../../domain/enum/outbox-status.enum";
import { FindOutboxQueryResult } from "../../../application/result/find-outbox-query.result";

export class FindTodayMenuOutboxResultDto {
  constructor(
    readonly id: string,
    readonly eventId: string,
    readonly eventType: EventType,
    readonly payload: TodayMenuPayload,
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

  public static from(params: FindOutboxQueryResult) {
    return new FindTodayMenuOutboxResultDto(
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
