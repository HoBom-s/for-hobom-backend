import { FutureMessageId } from "../../model/future-message-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { UpdateFutureMessageCommand } from "../out/update-future-message.command";

export interface UpdateFutureMessageUseCase {
  invoke(
    id: FutureMessageId,
    senderId: UserId,
    command: UpdateFutureMessageCommand,
  ): Promise<void>;
}
