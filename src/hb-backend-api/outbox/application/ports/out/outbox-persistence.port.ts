import { CreateOutboxEntity } from "../../../domain/entity/create-outbox.entity";
import { EventId } from "../../../domain/vo/event-id.vo";

export interface OutboxPersistencePort {
  save(entity: CreateOutboxEntity): Promise<void>;

  markAsSent(eventId: EventId): Promise<void>;

  markAsFailed(eventId: EventId, errorMessage: string): Promise<void>;
}
