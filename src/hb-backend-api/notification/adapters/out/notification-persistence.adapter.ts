import { Inject, Injectable } from "@nestjs/common";
import { NotificationPersistencePort } from "../../domain/ports/out/notification-persistence.port";
import { DIToken } from "../../../../shared/di/token.di";
import { NotificationRepository } from "../../domain/model/notification.repository";
import { NotificationCreateEntitySchema } from "../../domain/model/notification.entity";
import { NotificationId } from "../../domain/model/notification-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

@Injectable()
export class NotificationPersistenceAdapter implements NotificationPersistencePort {
  constructor(
    @Inject(DIToken.NotificationModule.NotificationRepository)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  public async save(schema: NotificationCreateEntitySchema): Promise<string> {
    return this.notificationRepository.save(schema);
  }

  public async markAsRead(id: NotificationId, owner: UserId): Promise<void> {
    await this.notificationRepository.markAsRead(id, owner);
  }

  public async deleteExpiredBatch(
    olderThan: Date,
    batchSize: number,
  ): Promise<number> {
    return this.notificationRepository.deleteExpiredBatch(olderThan, batchSize);
  }
}
