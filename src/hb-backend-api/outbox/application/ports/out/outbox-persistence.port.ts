import { CreateOutboxEntity } from "../../../domain/entity/create-outbox.entity";

export interface OutboxPersistencePort {
  save(entity: CreateOutboxEntity): Promise<void>;
}
