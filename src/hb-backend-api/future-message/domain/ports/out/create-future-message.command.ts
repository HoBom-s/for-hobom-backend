import { UserId } from "../../../../user/domain/model/user-id.vo";
import { SendStatus } from "../../model/send-status.enum";
import { CreateFutureMessageEntity } from "../../model/create-future-message.entity";

export class CreateFutureMessageCommand {
  constructor(
    private readonly senderId: UserId,
    private readonly recipientId: UserId,
    private readonly title: string,
    private readonly content: string,
    private readonly sendStatus: SendStatus,
    private readonly scheduledAt: string,
  ) {
    this.senderId = senderId;
    this.recipientId = recipientId;
    this.title = title;
    this.content = content;
    this.sendStatus = sendStatus;
    this.scheduledAt = scheduledAt;
  }

  public toEntity(): CreateFutureMessageEntity {
    return new CreateFutureMessageEntity(
      this.senderId,
      this.recipientId,
      this.title,
      this.content,
      this.sendStatus,
      this.scheduledAt,
    );
  }
}
