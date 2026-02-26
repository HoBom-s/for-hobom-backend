import { Inject, Injectable } from "@nestjs/common";
import { CreateNotificationUseCase } from "../../domain/ports/in/create-notification.use-case";
import { CreateNotificationCommand } from "../../domain/ports/out/create-notification.command";
import { NotificationPersistencePort } from "../../domain/ports/out/notification-persistence.port";
import { NotificationCreateEntitySchema } from "../../domain/model/notification.entity";
import { DIToken } from "../../../../shared/di/token.di";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class CreateNotificationService implements CreateNotificationUseCase {
  constructor(
    @Inject(DIToken.NotificationModule.NotificationPersistencePort)
    private readonly notificationPersistencePort: NotificationPersistencePort,
    @Inject(DIToken.OutboxModule.OutboxPersistencePort)
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(command: CreateNotificationCommand): Promise<void> {
    const schema = NotificationCreateEntitySchema.of(
      command.getCategory,
      command.getOwner,
      command.getTitle,
      command.getBody,
      command.getSenderId,
    );
    await this.notificationPersistencePort.save(schema);
  }
}
