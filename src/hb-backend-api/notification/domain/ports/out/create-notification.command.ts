import { UserId } from "../../../../user/domain/model/user-id.vo";
import { NotificationCategory } from "../../enums/notification-category.enum";

export class CreateNotificationCommand {
  constructor(
    private readonly category: NotificationCategory,
    private readonly owner: UserId,
    private readonly title: string,
    private readonly body: string,
    private readonly senderId: string,
    private readonly recipient: string,
  ) {}

  public static of(
    category: NotificationCategory,
    owner: UserId,
    title: string,
    body: string,
    senderId: string,
    recipient: string,
  ): CreateNotificationCommand {
    return new CreateNotificationCommand(
      category,
      owner,
      title,
      body,
      senderId,
      recipient,
    );
  }

  get getCategory(): NotificationCategory {
    return this.category;
  }
  get getOwner(): UserId {
    return this.owner;
  }
  get getTitle(): string {
    return this.title;
  }
  get getBody(): string {
    return this.body;
  }
  get getSenderId(): string {
    return this.senderId;
  }
  get getRecipient(): string {
    return this.recipient;
  }
}
