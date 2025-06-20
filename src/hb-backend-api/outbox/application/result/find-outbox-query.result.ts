import { OutboxId } from "../../domain/vo/outbox-id.vo";
import { EventType } from "../../domain/enum/event-type.enum";
import type { TodayMenuPayload } from "../../domain/factories/today-menu.payload";
import { OutboxStatus } from "../../domain/enum/outbox-status.enum";
import { FindOutboxEntity } from "../../domain/entity/find-outbox.entity";

export class FindOutboxQueryResult {
  constructor(
    private readonly id: OutboxId,
    private readonly eventId: string,
    private readonly eventType: EventType,
    private readonly payload: TodayMenuPayload,
    private readonly status: OutboxStatus,
    private readonly retryCount: number,
    private readonly sentAt: Date | null,
    private readonly failedAt: Date | null,
    private readonly lastError: string | null,
    private readonly version: number,
    private readonly createdAt: Date | null,
    private readonly updatedAt: Date | null,
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

  public static from(params: FindOutboxEntity) {
    return new FindOutboxQueryResult(
      params.getId,
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

  public get getId(): OutboxId {
    return this.id;
  }

  public get getEventId(): string {
    return this.eventId;
  }

  public get getEventType(): EventType {
    return this.eventType;
  }

  public get getPayload(): TodayMenuPayload {
    return this.payload;
  }

  public get getStatus(): OutboxStatus {
    return this.status;
  }

  public get getRetryCount(): number {
    return this.retryCount;
  }

  public get getSentAt(): Date | null {
    return this.sentAt;
  }

  public get getFailedAt(): Date | null {
    return this.failedAt;
  }

  public get getLastError(): string | null {
    return this.lastError;
  }

  public get getVersion(): number {
    return this.version;
  }

  public get getCreatedAt(): Date | null {
    return this.createdAt;
  }

  public get getUpdatedAt(): Date | null {
    return this.updatedAt;
  }
}
