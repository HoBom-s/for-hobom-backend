import { CreateOutboxEntity } from "../../domain/model/create-outbox.entity";
import { EventType } from "../../domain/model/event-type.enum";
import { OutboxStatus } from "../../domain/model/outbox-status.enum";
import { OutboxDocument } from "../../domain/model/outbox.schema";
import { EventId } from "../../domain/model/event-id.vo";

export interface OutboxRepository {
  save(entity: CreateOutboxEntity): Promise<void>;

  markAsSent(eventId: EventId): Promise<void>;

  markAsFailed(eventId: EventId, errorMessage: string): Promise<void>;

  findByEventTypeAndStatus(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<OutboxDocument[]>;
}
