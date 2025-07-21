import { EventType } from "./event-type.enum";
import { OutboxStatus } from "./outbox-status.enum";
import { OutboxId } from "./outbox-id.vo";
import { OutboxPayloadType } from "./outbox-payload.parser";

export class FindOutboxEntity {
  constructor(
    private readonly id: OutboxId,
    private readonly eventId: string,
    private readonly eventType: EventType,
    private readonly payload: OutboxPayloadType,
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

  public static of(params: {
    id: OutboxId;
    eventId: string;
    eventType: EventType;
    payload: OutboxPayloadType;
    status: OutboxStatus;
    retryCount: number;
    sentAt: Date | null;
    failedAt: Date | null;
    lastError: string | null;
    version: number;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): FindOutboxEntity {
    return new FindOutboxEntity(
      params.id,
      params.eventId,
      params.eventType,
      params.payload,
      params.status,
      params.retryCount,
      params.sentAt,
      params.failedAt,
      params.lastError,
      params.version,
      params.createdAt,
      params.updatedAt,
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

  public get getPayload(): OutboxPayloadType {
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
