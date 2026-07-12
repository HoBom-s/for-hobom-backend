import { FutureMessageId } from "../../model/future-message-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";

export interface DeleteFutureMessageUseCase {
  invoke(id: FutureMessageId, senderId: UserId): Promise<void>;
}
