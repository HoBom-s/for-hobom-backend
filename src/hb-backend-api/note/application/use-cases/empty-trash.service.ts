import { Inject, Injectable } from "@nestjs/common";
import { EmptyTrashUseCase } from "../../domain/ports/in/empty-trash.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { NotePersistencePort } from "../../domain/ports/out/note-persistence.port";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class EmptyTrashService implements EmptyTrashUseCase {
  constructor(
    @Inject(DIToken.NoteModule.NotePersistencePort)
    private readonly notePersistencePort: NotePersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(owner: UserId): Promise<void> {
    await this.notePersistencePort.emptyTrash(owner);
  }
}
