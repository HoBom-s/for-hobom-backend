import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { NotificationCategory } from "../enums/notification-category.enum";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { NotificationId } from "./notification-id.vo";

@Schema({ collection: "notifications" })
export class NotificationEntity extends BaseEntity {
  @Prop({
    type: String,
    enum: NotificationCategory,
    required: true,
  })
  category: NotificationCategory;

  @Prop({ type: Types.ObjectId, ref: "user", required: true, index: true })
  owner: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  body: string;

  @Prop({ type: String, required: true })
  senderId: string;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;
}

export class NotificationEntitySchema {
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

  public static of(
    id: NotificationId,
    category: NotificationCategory,
    owner: UserId,
    title: string,
    body: string,
    senderId: string,
    isRead: boolean,
    createdAt: Date,
  ): NotificationEntitySchema {
    return new NotificationEntitySchema(
      id,
      category,
      owner,
      title,
      body,
      senderId,
      isRead,
      createdAt,
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

export class NotificationCreateEntitySchema {
  constructor(
    private readonly category: NotificationCategory,
    private readonly owner: UserId,
    private readonly title: string,
    private readonly body: string,
    private readonly senderId: string,
  ) {}

  public static of(
    category: NotificationCategory,
    owner: UserId,
    title: string,
    body: string,
    senderId: string,
  ): NotificationCreateEntitySchema {
    return new NotificationCreateEntitySchema(
      category,
      owner,
      title,
      body,
      senderId,
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
}
