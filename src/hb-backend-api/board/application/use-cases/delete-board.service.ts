import { Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, Observable, switchMap } from "rxjs";
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
    await lastValueFrom(
      this.verifyExists(id).pipe(switchMap(() => this.deleteBoard(id))),
    );
  }

  private verifyExists(id: BoardId): Observable<void> {
    return from(this.boardQueryPort.findById(id)).pipe(
      switchMap(() => from(Promise.resolve())),
    );
  }

  private deleteBoard(id: BoardId): Observable<void> {
    return from(this.boardPersistencePort.deleteOne(id));
  }
}
