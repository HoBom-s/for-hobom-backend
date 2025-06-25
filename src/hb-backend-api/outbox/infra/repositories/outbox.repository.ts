import { CreateOutboxEntity } from "../../domain/entity/create-outbox.entity";
import { EventType } from "../../domain/enum/event-type.enum";
import { OutboxStatus } from "../../domain/enum/outbox-status.enum";
import { OutboxDocument } from "../../domain/entity/outbox.schema";
import { EventId } from "../../domain/vo/event-id.vo";

export interface OutboxRepository {
  save(entity: CreateOutboxEntity): Promise<void>;

  markAsSent(eventId: EventId): Promise<void>;

  markAsFailed(eventId: EventId, errorMessage: string): Promise<void>;

  findByEventTypeAndStatus(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<OutboxDocument[]>;
}
