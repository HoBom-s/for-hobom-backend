import { UserId } from "../../../user/domain/model/user-id.vo";
import { SendStatus } from "./send-status.enum";

export class CreateFutureMessageEntity {
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

  public static of(
    senderId: UserId,
    recipientId: UserId,
    title: string,
    content: string,
    sendStatus: SendStatus,
    scheduledAt: string,
  ): CreateFutureMessageEntity {
    return new CreateFutureMessageEntity(
      senderId,
      recipientId,
      title,
      content,
      sendStatus,
      scheduledAt,
    );
  }

  public get getSenderId(): UserId {
    return this.senderId;
  }
  public get getRecipientId(): UserId {
    return this.recipientId;
  }

  public get getTitle(): string {
    return this.title;
  }

  public get getContent(): string {
    return this.content;
  }

  public get getSendStatus(): SendStatus {
    return this.sendStatus;
  }

  public get getScheduledAt(): string {
    return this.scheduledAt;
  }
}
