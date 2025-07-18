import { FutureMessageId } from "../../model/future-message-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { SendStatus } from "../../model/send-status.enum";
import { FutureMessageDomain } from "../../model/future-message.domain";

export class FutureMessageQueryResult {
  constructor(
    private readonly id: FutureMessageId,
    private readonly senderId: UserId,
    private readonly recipientId: UserId,
    private readonly title: string,
    private readonly content: string,
    private readonly sendStatus: SendStatus,
    private readonly scheduledAt: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {
    this.id = id;
    this.senderId = recipientId;
    this.recipientId = recipientId;
    this.title = title;
    this.content = content;
    this.sendStatus = sendStatus;
    this.scheduledAt = scheduledAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static from(domain: FutureMessageDomain): FutureMessageQueryResult {
    return new FutureMessageQueryResult(
      domain.getId,
      domain.getSenderId,
      domain.getRecipientId,
      domain.getTitle,
      domain.getContent,
      domain.getSendStatus,
      domain.getScheduledAt,
      domain.getCreatedAt,
      domain.getUpdatedAt,
    );
  }

  public get getId(): FutureMessageId {
    return this.id;
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

  public get getCreatedAt(): Date {
    return this.createdAt;
  }

  public get getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
