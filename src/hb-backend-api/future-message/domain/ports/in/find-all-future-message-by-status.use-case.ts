import { SendStatus } from "../../model/send-status.enum";
import { FutureMessageQueryResult } from "../out/future-message-query.result";
import { UserId } from "../../../../user/domain/model/user-id.vo";

export interface FindAllFutureMessageByStatusUseCase {
  invoke(
    status: SendStatus,
    senderId: UserId,
  ): Promise<FutureMessageQueryResult[]>;
}
