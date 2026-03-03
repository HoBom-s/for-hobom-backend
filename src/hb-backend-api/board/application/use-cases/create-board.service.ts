import { Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, Observable } from "rxjs";
import { CreateBoardUseCase } from "../../ports/in/create-board.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { BoardPersistencePort } from "../../ports/out/board-persistence.port";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { BoardType } from "../../domain/enums/board-type.enum";
import { CreateBoardEntity } from "../../domain/model/board.entity";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class CreateBoardService implements CreateBoardUseCase {
  constructor(
    @Inject(DIToken.BoardModule.BoardPersistencePort)
    private readonly boardPersistencePort: BoardPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    projectId: ProjectId,
    name: string,
    type: BoardType,
    createdBy: UserId,
  ): Promise<void> {
    await lastValueFrom(this.saveBoard(projectId, name, type, createdBy));
  }

  private saveBoard(
    projectId: ProjectId,
    name: string,
    type: BoardType,
    createdBy: UserId,
  ): Observable<void> {
    return from(
      this.boardPersistencePort.save(
        CreateBoardEntity.of(projectId, name, type, createdBy),
      ),
    );
  }
}
