import { NotificationId } from "../../model/notification-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { NotificationCategory } from "../../enums/notification-category.enum";
import { NotificationEntitySchema } from "../../model/notification.entity";

export class NotificationQueryResult {
  constructor(
    private readonly id: NotificationId,
    private readonly category: NotificationCategory,
    private readonly owner: UserId,
    private readonly title: string,
    private readonly body: string,
    private readonly senderId: string,
    private readonly isRead: boolean,
    private readonly createdAt: Date,
  ) {}

  public static from(
    entity: NotificationEntitySchema,
  ): NotificationQueryResult {
    return new NotificationQueryResult(
      entity.getId,
      entity.getCategory,
      entity.getOwner,
      entity.getTitle,
      entity.getBody,
      entity.getSenderId,
      entity.getIsRead,
      entity.getCreatedAt,
    );
  }

  get getId(): NotificationId {
    return this.id;
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
  get getIsRead(): boolean {
    return this.isRead;
  }
  get getCreatedAt(): Date {
    return this.createdAt;
  }
}
