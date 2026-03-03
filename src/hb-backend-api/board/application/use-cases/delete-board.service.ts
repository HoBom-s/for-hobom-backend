import { Inject, Injectable } from "@nestjs/common";
import { DeleteBoardUseCase } from "../../ports/in/delete-board.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { BoardPersistencePort } from "../../ports/out/board-persistence.port";
import { BoardQueryPort } from "../../ports/out/board-query.port";
import { BoardId } from "../../domain/model/board-id.vo";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class DeleteBoardService implements DeleteBoardUseCase {
  constructor(
    @Inject(DIToken.BoardModule.BoardPersistencePort)
    private readonly boardPersistencePort: BoardPersistencePort,
    @Inject(DIToken.BoardModule.BoardQueryPort)
    private readonly boardQueryPort: BoardQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(id: BoardId): Promise<void> {
    await this.boardQueryPort.findById(id);
    await this.boardPersistencePort.deleteOne(id);
  }
}
