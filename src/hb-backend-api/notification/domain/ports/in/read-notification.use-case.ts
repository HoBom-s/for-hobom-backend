import { NotificationId } from "../../model/notification-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";

export interface ReadNotificationUseCase {
  invoke(id: NotificationId, owner: UserId): Promise<void>;
}
