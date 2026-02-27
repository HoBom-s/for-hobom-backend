import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { UpdateFutureMessageUseCase } from "../../domain/ports/in/update-future-message.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { FutureMessagePersistencePort } from "../../domain/ports/out/future-message-persistence.port";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { FutureMessageId } from "../../domain/model/future-message-id.vo";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { UpdateFutureMessageCommand } from "../../domain/ports/out/update-future-message.command";

@Injectable()
export class UpdateFutureMessageService implements UpdateFutureMessageUseCase {
  constructor(
    @Inject(DIToken.FutureMessageModule.FutureMessagePersistencePort)
    private readonly futureMessagePersistencePort: FutureMessagePersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    id: FutureMessageId,
    senderId: UserId,
    command: UpdateFutureMessageCommand,
  ): Promise<void> {
    const message = await this.futureMessagePersistencePort.load(id);

    if (!message.getSenderId.equals(senderId)) {
      throw new BadRequestException("본인이 작성한 메시지만 수정할 수 있어요.");
    }
    if (message.isSentMessage()) {
      throw new BadRequestException("이미 발송된 메시지는 수정할 수 없어요.");
    }

    const data: Record<string, unknown> = {};
    if (command.getTitle !== undefined) data.title = command.getTitle;
    if (command.getContent !== undefined) data.content = command.getContent;
    if (command.getScheduledAt !== undefined)
      data.scheduledAt = command.getScheduledAt;

    if (Object.keys(data).length > 0) {
      await this.futureMessagePersistencePort.update(id, data);
    }
  }
}
