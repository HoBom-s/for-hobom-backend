import { UserId } from "../../../../user/domain/model/user-id.vo";
import { NotificationQueryResult } from "../out/notification-query.result";

export interface GetAllNotificationsUseCase {
  invoke(owner: UserId): Promise<NotificationQueryResult[]>;
}
