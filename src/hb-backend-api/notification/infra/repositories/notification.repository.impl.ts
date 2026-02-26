import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { NotificationRepository } from "../../domain/model/notification.repository";
import { NotificationDocument } from "../../domain/model/notification.schema";
import {
  NotificationCreateEntitySchema,
  NotificationEntity,
} from "../../domain/model/notification.entity";
import { NotificationId } from "../../domain/model/notification-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class NotificationRepositoryImpl implements NotificationRepository {
  constructor(
    @InjectModel(NotificationEntity.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  public async save(schema: NotificationCreateEntitySchema): Promise<string> {
    const session = MongoSessionContext.getSession();
    const [created] = await this.notificationModel.create(
      [
        {
          category: schema.getCategory,
          owner: schema.getOwner.raw,
          title: schema.getTitle,
          body: schema.getBody,
          senderId: schema.getSenderId,
        },
      ],
      { session },
    );
    return String(created._id);
  }

  public async findAllByOwner(owner: UserId): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ owner: owner.raw })
      .sort({ createdAt: -1 })
      .exec();
  }

  public async markAsRead(id: NotificationId, owner: UserId): Promise<void> {
    const result = await this.notificationModel.findOneAndUpdate(
      { _id: id.raw, owner: owner.raw },
      { $set: { isRead: true } },
    );
    if (result == null) {
      throw new NotFoundException(
        `해당 알림을 찾을 수 없어요. ID: ${id.toString()}`,
      );
    }
  }
}
