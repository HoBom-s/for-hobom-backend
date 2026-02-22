import { Inject, Injectable } from "@nestjs/common";
import { UpdateNoteStatusUseCase } from "../../domain/ports/in/update-note-status.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { NotePersistencePort } from "../../domain/ports/out/note-persistence.port";
import { NoteQueryPort } from "../../domain/ports/out/note-query.port";
import { NoteId } from "../../domain/model/note-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { NoteStatus } from "../../domain/enums/note-status.enum";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class UpdateNoteStatusService implements UpdateNoteStatusUseCase {
  constructor(
    @Inject(DIToken.NoteModule.NotePersistencePort)
    private readonly notePersistencePort: NotePersistencePort,
    @Inject(DIToken.NoteModule.NoteQueryPort)
    private readonly noteQueryPort: NoteQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    id: NoteId,
    owner: UserId,
    status: NoteStatus,
  ): Promise<void> {
    const note = await this.noteQueryPort.findById(id, owner);
    const trashedAt = status === NoteStatus.TRASHED ? new Date() : null;
    await this.notePersistencePort.updateStatus(
      note.getId,
      owner,
      status,
      trashedAt,
    );
  }
}
