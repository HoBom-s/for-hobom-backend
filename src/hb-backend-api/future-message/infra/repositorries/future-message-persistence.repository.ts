import { FutureMessageId } from "../../domain/model/future-message-id.vo";
import { FutureMessageDomain } from "../../domain/model/future-message.domain";
import { CreateFutureMessageEntity } from "../../domain/model/create-future-message.entity";

export interface FutureMessagePersistenceRepository {
  load(id: FutureMessageId): Promise<FutureMessageDomain>;

  save(entity: CreateFutureMessageEntity): Promise<void>;

  markAsSent(id: FutureMessageId): Promise<void>;
}
