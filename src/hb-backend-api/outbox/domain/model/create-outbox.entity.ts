import { EventType } from "./event-type.enum";
import { OutboxStatus } from "./outbox-status.enum";

export class CreateOutboxEntity {
  constructor(
    private readonly eventType: EventType,
    private readonly payload: Record<string, any>,
    private readonly status: OutboxStatus,
    private readonly retryCount: number,
    private readonly version: number,
  ) {
    this.eventType = eventType;
    this.payload = payload;
    this.status = status;
    this.retryCount = retryCount;
  }

  public static of(
    eventType: EventType,
    payload: Record<string, any>,
    status: OutboxStatus,
    retryCount: number,
    version: number,
  ): CreateOutboxEntity {
    return new CreateOutboxEntity(
      eventType,
      payload,
      status,
      retryCount,
      version,
    );
  }

  public get getEventType(): EventType {
    return this.eventType;
  }

  public get getPayload(): Record<string, any> {
    return this.payload;
  }

  public get getStatus(): OutboxStatus {
    return this.status;
  }

  public get getRetryCount(): number {
    return this.retryCount;
  }

  public get getVersion(): number {
    return this.version;
  }
}
