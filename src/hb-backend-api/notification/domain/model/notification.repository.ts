import { NotificationCreateEntitySchema } from "./notification.entity";
import { NotificationId } from "./notification-id.vo";
import { NotificationDocument } from "./notification.schema";
import { UserId } from "../../../user/domain/model/user-id.vo";

export interface NotificationRepository {
  save(schema: NotificationCreateEntitySchema): Promise<string>;
  findAllByOwner(owner: UserId): Promise<NotificationDocument[]>;
  findByOwnerWithCursor(
    owner: UserId,
    cursor: string | undefined,
    limit: number,
  ): Promise<NotificationDocument[]>;
  markAsRead(id: NotificationId, owner: UserId): Promise<void>;
  deleteExpiredBatch(olderThan: Date, batchSize: number): Promise<number>;
}
