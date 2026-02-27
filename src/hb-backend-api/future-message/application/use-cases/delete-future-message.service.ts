import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { DeleteFutureMessageUseCase } from "../../domain/ports/in/delete-future-message.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { FutureMessagePersistencePort } from "../../domain/ports/out/future-message-persistence.port";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { FutureMessageId } from "../../domain/model/future-message-id.vo";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";

@Injectable()
export class DeleteFutureMessageService implements DeleteFutureMessageUseCase {
  constructor(
    @Inject(DIToken.FutureMessageModule.FutureMessagePersistencePort)
    private readonly futureMessagePersistencePort: FutureMessagePersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(id: FutureMessageId, senderId: UserId): Promise<void> {
    const message = await this.futureMessagePersistencePort.load(id);

    if (!message.getSenderId.equals(senderId)) {
      throw new BadRequestException("본인이 작성한 메시지만 삭제할 수 있어요.");
    }
    if (message.isSentMessage()) {
      throw new BadRequestException("이미 발송된 메시지는 삭제할 수 없어요.");
    }

    await this.futureMessagePersistencePort.deleteOne(id);
  }
}
