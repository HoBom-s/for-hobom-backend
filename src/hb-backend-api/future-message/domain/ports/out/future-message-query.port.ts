import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { SendStatus } from "../../model/send-status.enum";
import { FutureMessageId } from "../../model/future-message-id.vo";
import { FutureMessageQueryResult } from "./future-message-query.result";

export interface FutureMessageQueryPort {
  findAllBySendStatus(
    sendStatus: SendStatus,
    senderId: UserId,
  ): Promise<FutureMessageQueryResult[]>;

  findById(id: FutureMessageId): Promise<FutureMessageQueryResult>;
}
