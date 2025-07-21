import { FutureMessageId } from "../../model/future-message-id.vo";
import { FutureMessageDomain } from "../../model/future-message.domain";
import { CreateFutureMessageEntity } from "../../model/create-future-message.entity";

export interface FutureMessagePersistencePort {
  load(id: FutureMessageId): Promise<FutureMessageDomain>;

  save(entity: CreateFutureMessageEntity): Promise<void>;

  markAsSent(id: FutureMessageId): Promise<void>;
}
