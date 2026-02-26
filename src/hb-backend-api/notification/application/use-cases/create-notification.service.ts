import { Inject, Injectable } from "@nestjs/common";
import { CreateNotificationUseCase } from "../../domain/ports/in/create-notification.use-case";
import { CreateNotificationCommand } from "../../domain/ports/out/create-notification.command";
import { NotificationPersistencePort } from "../../domain/ports/out/notification-persistence.port";
import { NotificationCreateEntitySchema } from "../../domain/model/notification.entity";
import { DIToken } from "../../../../shared/di/token.di";
import { OutboxPersistencePort } from "../../../outbox/domain/ports/out/outbox-persistence.port";
import { OutboxPayloadFactoryRegistry } from "../../../outbox/domain/model/outbox-payload-factory.registry";
import { CreateOutboxEntity } from "../../../outbox/domain/model/create-outbox.entity";
import { OutboxStatus } from "../../../outbox/domain/model/outbox-status.enum";
import { EventType } from "../../../outbox/domain/model/event-type.enum";
import { MessageEnum } from "../../../outbox/domain/model/message.enum";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class CreateNotificationService implements CreateNotificationUseCase {
  constructor(
    @Inject(DIToken.NotificationModule.NotificationPersistencePort)
    private readonly notificationPersistencePort: NotificationPersistencePort,
    @Inject(DIToken.OutboxModule.OutboxPersistencePort)
    private readonly outboxPersistencePort: OutboxPersistencePort,
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
    const notificationId = await this.notificationPersistencePort.save(schema);

    const payload = OutboxPayloadFactoryRegistry.MESSAGE({
      id: notificationId,
      title: command.getTitle,
      body: command.getBody,
      recipient: command.getRecipient,
      senderId: command.getSenderId,
      type: MessageEnum.PUSH_MESSAGE,
    });

    const outbox = CreateOutboxEntity.of(
      EventType.MESSAGE,
      payload,
      OutboxStatus.PENDING,
      1,
      1,
    );

    await this.outboxPersistencePort.save(outbox);
  }
}
