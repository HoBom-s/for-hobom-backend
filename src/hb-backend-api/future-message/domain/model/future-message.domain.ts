import { SendStatus } from "./send-status.enum";
import { FutureMessageId } from "./future-message-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

export class FutureMessageDomain {
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

  public static of(
    id: FutureMessageId,
    senderId: UserId,
    recipientId: UserId,
    title: string,
    content: string,
    sendStatus: SendStatus,
    scheduledAt: string,
    createdAt: Date,
    updatedAt: Date,
  ): FutureMessageDomain {
    return new FutureMessageDomain(
      id,
      senderId,
      recipientId,
      title,
      content,
      sendStatus,
      scheduledAt,
      createdAt,
      updatedAt,
    );
  }

  public isSentMessage(): boolean {
    return this.sendStatus === SendStatus.SENT;
  }

  public isPendingMessage(): boolean {
    return this.sendStatus === SendStatus.PENDING;
  }

  public isSameScheduledAtFromDate(todayDateString: string): boolean {
    return this.scheduledAt === todayDateString;
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
