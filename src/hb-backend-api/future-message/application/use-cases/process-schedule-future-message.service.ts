import { Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom } from "rxjs";
import { concatMap } from "rxjs/operators";
import { ProcessScheduleFutureMessageUseCase } from "../../domain/ports/in/process-schedule-future-message.use-case";
import { FutureMessageQueryPort } from "../../domain/ports/out/future-message-query.port";
import { FutureMessageDomain } from "../../domain/model/future-message.domain";
import { SendStatus } from "../../domain/model/send-status.enum";
import { DIToken } from "../../../../shared/di/token.di";
import { OutboxPersistencePort } from "../../../outbox/domain/ports/out/outbox-persistence.port";
import { OutboxPayloadFactoryRegistry } from "../../../outbox/domain/model/outbox-payload-factory.registry";
import { UserQueryPort } from "../../../user/domain/ports/out/user-query.port";
import { MessageEnum } from "../../../outbox/domain/model/message.enum";
import { CreateOutboxEntity } from "../../../outbox/domain/model/create-outbox.entity";
import { EventType } from "../../../outbox/domain/model/event-type.enum";
import { OutboxStatus } from "../../../outbox/domain/model/outbox-status.enum";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { FutureMessagePersistencePort } from "../../domain/ports/out/future-message-persistence.port";
import { FutureMessageId } from "../../domain/model/future-message-id.vo";
import { FutureMessageQueryResult } from "../../domain/ports/out/future-message-query.result";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class ProcessScheduleFutureMessageService
  implements ProcessScheduleFutureMessageUseCase
{
  constructor(
    @Inject(DIToken.FutureMessageModule.FutureMessageQueryPort)
    private readonly futureMessageQueryPort: FutureMessageQueryPort,
    @Inject(DIToken.FutureMessageModule.FutureMessagePersistencePort)
    private readonly futureMessagePersistencePort: FutureMessagePersistencePort,
    @Inject(DIToken.OutboxModule.OutboxPersistencePort)
    private readonly outboxPersistencePort: OutboxPersistencePort,
    @Inject(DIToken.UserModule.UserQueryPort)
    private readonly userQueryPort: UserQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(): Promise<void> {
    const dueMessages = await this.getDueMessages();
    if (dueMessages.length === 0) return;
    await this.processMessagesSequentially(dueMessages);
  }

  private async getDueMessages(): Promise<FutureMessageDomain[]> {
    const pendingMessages =
      await this.futureMessageQueryPort.findAllBySendStatusWithoutSenderId(
        SendStatus.PENDING,
      );
    const domains = pendingMessages.map(this.convertToDomain);
    const now = new Date();

    return domains.filter((message) => message.isDueToSend(now));
  }

  private async processMessagesSequentially(
    messages: FutureMessageDomain[],
  ): Promise<void> {
    await lastValueFrom(
      from(messages).pipe(
        concatMap((message) => from(this.sendAndMarkAsSent(message))),
      ),
    );
  }

  private async sendAndMarkAsSent(message: FutureMessageDomain): Promise<void> {
    try {
      await this.send(message);
      await this.markAsSent(message.getId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      await this.createOutboxFailFromMessage(message);
    }
  }

  private async send(message: FutureMessageDomain): Promise<void> {
    const outboxEntity = await this.createOutboxFromMessage(message);
    await this.outboxPersistencePort.save(outboxEntity);
  }

  private async markAsSent(id: FutureMessageId): Promise<void> {
    await this.futureMessagePersistencePort.markAsSent(id);
  }

  private convertToDomain(
    query: FutureMessageQueryResult,
  ): FutureMessageDomain {
    return FutureMessageDomain.of(
      query.getId,
      query.getSenderId,
      query.getRecipientId,
      query.getTitle,
      query.getContent,
      query.getSendStatus,
      query.getScheduledAt,
      query.getCreatedAt,
      query.getUpdatedAt,
    );
  }

  private async createOutboxFromMessage(
    message: FutureMessageDomain,
  ): Promise<CreateOutboxEntity> {
    const recipientId = message.getRecipientId;
    const recipient = await this.userQueryPort.findById(recipientId);
    const payload = OutboxPayloadFactoryRegistry.MESSAGE({
      id: message.getId.toString(),
      title: message.getTitle,
      body: message.getContent,
      recipient: recipient.getEmail,
      senderId: message.getSenderId.toString(),
      type: MessageEnum.MAIL_MESSAGE,
    });

    return CreateOutboxEntity.of(
      EventType.MESSAGE,
      payload,
      OutboxStatus.PENDING,
      1,
      1,
    );
  }

  private async createOutboxFailFromMessage(
    message: FutureMessageDomain,
  ): Promise<CreateOutboxEntity> {
    const recipientId = message.getRecipientId;
    const recipient = await this.userQueryPort.findById(recipientId);
    const payload = OutboxPayloadFactoryRegistry.MESSAGE({
      id: message.getId.toString(),
      title: message.getTitle,
      body: message.getContent,
      recipient: recipient.getEmail,
      senderId: message.getSenderId.toString(),
      type: MessageEnum.MAIL_MESSAGE,
    });

    return CreateOutboxEntity.of(
      EventType.MESSAGE,
      payload,
      OutboxStatus.FAILED,
      1,
      1,
    );
  }
}
