import { UserId } from "../../../../user/domain/model/user-id.vo";
import { NotificationEntitySchema } from "../../model/notification.entity";

export interface NotificationQueryPort {
  findAllByOwner(owner: UserId): Promise<NotificationEntitySchema[]>;
}
