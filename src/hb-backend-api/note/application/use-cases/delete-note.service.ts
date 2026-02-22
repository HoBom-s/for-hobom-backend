import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { DeleteNoteUseCase } from "../../domain/ports/in/delete-note.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { NotePersistencePort } from "../../domain/ports/out/note-persistence.port";
import { NoteQueryPort } from "../../domain/ports/out/note-query.port";
import { NoteId } from "../../domain/model/note-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { NoteStatus } from "../../domain/enums/note-status.enum";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class DeleteNoteService implements DeleteNoteUseCase {
  constructor(
    @Inject(DIToken.NoteModule.NotePersistencePort)
    private readonly notePersistencePort: NotePersistencePort,
    @Inject(DIToken.NoteModule.NoteQueryPort)
    private readonly noteQueryPort: NoteQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(id: NoteId, owner: UserId): Promise<void> {
    const note = await this.noteQueryPort.findById(id, owner);
    if (!note.isTrashed()) {
      throw new BadRequestException(
        "휴지통에 있는 노트만 영구 삭제할 수 있어요.",
      );
    }
    await this.notePersistencePort.deleteOne(note.getId, owner);
  }
}
