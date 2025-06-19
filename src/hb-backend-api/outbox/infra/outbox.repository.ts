import { CreateOutboxEntity } from "../domain/entity/create-outbox.entity";

export interface OutboxRepository {
  save(entity: CreateOutboxEntity): Promise<void>;
}
