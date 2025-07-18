import { CreateOutboxEntity } from "../../model/create-outbox.entity";
import { EventId } from "../../model/event-id.vo";

export interface OutboxPersistencePort {
  save(entity: CreateOutboxEntity): Promise<void>;

  markAsSent(eventId: EventId): Promise<void>;

  markAsFailed(eventId: EventId, errorMessage: string): Promise<void>;
}
