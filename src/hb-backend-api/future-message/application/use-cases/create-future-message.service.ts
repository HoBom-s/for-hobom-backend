import { Inject, Injectable } from "@nestjs/common";
import { CreateFutureMessageCommand } from "../../domain/ports/out/create-future-message.command";
import { CreateFutureMessageUseCase } from "../../domain/ports/in/create-future-message.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { FutureMessagePersistencePort } from "../../domain/ports/out/future-message-persistence.port";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class CreateFutureMessageService implements CreateFutureMessageUseCase {
  constructor(
    @Inject(DIToken.FutureMessageModule.FutureMessagePersistencePort)
    private readonly futureMessagePersistencePort: FutureMessagePersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(command: CreateFutureMessageCommand): Promise<void> {
    await this.save(command);
  }

  private async save(command: CreateFutureMessageCommand): Promise<void> {
    await this.futureMessagePersistencePort.save(command.toEntity());
  }
}
