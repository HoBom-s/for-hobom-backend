import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
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

  public async findByOwnerWithCursor(
    owner: UserId,
    cursor: string | undefined,
    limit: number,
  ): Promise<NotificationDocument[]> {
    const filter: Record<string, unknown> = { owner: owner.raw };
    if (cursor != null) {
      filter._id = { $lt: new Types.ObjectId(cursor) };
    }
    return this.notificationModel
      .find(filter)
      .sort({ _id: -1 })
      .limit(limit)
      .exec();
  }

  public async deleteExpiredBatch(
    olderThan: Date,
    batchSize: number,
  ): Promise<number> {
    const docs = await this.notificationModel
      .find({ createdAt: { $lt: olderThan } })
      .limit(batchSize)
      .select("_id")
      .lean()
      .exec();
    if (docs.length === 0) {
      return 0;
    }
    const ids = docs.map((doc) => doc._id);
    const result = await this.notificationModel.deleteMany({
      _id: { $in: ids },
    });
    return result.deletedCount;
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
