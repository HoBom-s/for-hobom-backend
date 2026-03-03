import { Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, Observable, switchMap } from "rxjs";
import { UpdateBoardUseCase } from "../../ports/in/update-board.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { BoardPersistencePort } from "../../ports/out/board-persistence.port";
import { BoardQueryPort } from "../../ports/out/board-query.port";
import { BoardId } from "../../domain/model/board-id.vo";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class UpdateBoardService implements UpdateBoardUseCase {
  constructor(
    @Inject(DIToken.BoardModule.BoardPersistencePort)
    private readonly boardPersistencePort: BoardPersistencePort,
    @Inject(DIToken.BoardModule.BoardQueryPort)
    private readonly boardQueryPort: BoardQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    id: BoardId,
    data: Record<string, unknown>,
  ): Promise<void> {
    await lastValueFrom(
      this.verifyExists(id).pipe(switchMap(() => this.updateBoard(id, data))),
    );
  }

  private verifyExists(id: BoardId): Observable<void> {
    return from(this.boardQueryPort.findById(id)).pipe(
      switchMap(() => from(Promise.resolve())),
    );
  }

  private updateBoard(
    id: BoardId,
    data: Record<string, unknown>,
  ): Observable<void> {
    return from(this.boardPersistencePort.update(id, data));
  }
}
