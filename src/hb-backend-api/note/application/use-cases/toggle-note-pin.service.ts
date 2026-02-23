import { Inject, Injectable } from "@nestjs/common";
import { ToggleNotePinUseCase } from "../../domain/ports/in/toggle-note-pin.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { NotePersistencePort } from "../../domain/ports/out/note-persistence.port";
import { NoteQueryPort } from "../../domain/ports/out/note-query.port";
import { NoteId } from "../../domain/model/note-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class ToggleNotePinService implements ToggleNotePinUseCase {
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
    await this.notePersistencePort.togglePin(
      note.getId,
      owner,
      !note.getIsPinned,
    );
  }
}
