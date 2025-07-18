import { FutureMessageDomain } from "../../domain/model/future-message.domain";
import { SendStatus } from "../../domain/model/send-status.enum";
import { FutureMessageId } from "../../domain/model/future-message-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

export interface FutureMessageQueryRepository {
  findAllBySendStatus(
    sendStatus: SendStatus,
    senderId: UserId,
  ): Promise<FutureMessageDomain[]>;

  findById(id: FutureMessageId): Promise<FutureMessageDomain>;
}
