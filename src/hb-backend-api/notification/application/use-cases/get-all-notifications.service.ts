import { Inject, Injectable } from "@nestjs/common";
import { GetAllNotificationsUseCase } from "../../domain/ports/in/get-all-notifications.use-case";
import { NotificationQueryPort } from "../../domain/ports/out/notification-query.port";
import { NotificationQueryResult } from "../../domain/ports/out/notification-query.result";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { DIToken } from "../../../../shared/di/token.di";

@Injectable()
export class GetAllNotificationsService implements GetAllNotificationsUseCase {
  constructor(
    @Inject(DIToken.NotificationModule.NotificationQueryPort)
    private readonly notificationQueryPort: NotificationQueryPort,
  ) {}

  public async invoke(owner: UserId): Promise<NotificationQueryResult[]> {
    const notifications =
      await this.notificationQueryPort.findAllByOwner(owner);
    if (notifications.length === 0) {
      return [];
    }
    return notifications.map(NotificationQueryResult.from);
  }
}
