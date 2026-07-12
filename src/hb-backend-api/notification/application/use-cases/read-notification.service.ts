import { Inject, Injectable } from "@nestjs/common";
import { ReadNotificationUseCase } from "../../domain/ports/in/read-notification.use-case";
import { NotificationPersistencePort } from "../../domain/ports/out/notification-persistence.port";
import { NotificationId } from "../../domain/model/notification-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { DIToken } from "../../../../shared/di/token.di";

@Injectable()
export class ReadNotificationService implements ReadNotificationUseCase {
  constructor(
    @Inject(DIToken.NotificationModule.NotificationPersistencePort)
    private readonly notificationPersistencePort: NotificationPersistencePort,
  ) {}

  public async invoke(id: NotificationId, owner: UserId): Promise<void> {
    await this.notificationPersistencePort.markAsRead(id, owner);
  }
}
