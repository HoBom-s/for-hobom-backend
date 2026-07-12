import { NotificationCreateEntitySchema } from "../../model/notification.entity";
import { NotificationId } from "../../model/notification-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";

export interface NotificationPersistencePort {
  save(schema: NotificationCreateEntitySchema): Promise<string>;
  markAsRead(id: NotificationId, owner: UserId): Promise<void>;
  deleteExpiredBatch(olderThan: Date, batchSize: number): Promise<number>;
}
