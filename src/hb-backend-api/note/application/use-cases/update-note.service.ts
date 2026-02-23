import { Inject, Injectable } from "@nestjs/common";
import { UpdateNoteUseCase } from "../../domain/ports/in/update-note.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { NotePersistencePort } from "../../domain/ports/out/note-persistence.port";
import { NoteQueryPort } from "../../domain/ports/out/note-query.port";
import { NoteId } from "../../domain/model/note-id.vo";
import { UpdateNoteCommand } from "../../domain/ports/out/update-note.command";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class UpdateNoteService implements UpdateNoteUseCase {
  constructor(
    @Inject(DIToken.NoteModule.NotePersistencePort)
    private readonly notePersistencePort: NotePersistencePort,
    @Inject(DIToken.NoteModule.NoteQueryPort)
    private readonly noteQueryPort: NoteQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(id: NoteId, command: UpdateNoteCommand): Promise<void> {
    const note = await this.noteQueryPort.findById(id, command.getOwner);
    const data: Record<string, unknown> = {};

    if (command.getTitle !== undefined) data.title = command.getTitle;
    if (command.getContent !== undefined) data.content = command.getContent;
    if (command.getChecklistItems !== undefined) {
      data.checklistItems = command.getChecklistItems.map((i) => i.toPlain());
    }
    if (command.getColor !== undefined) data.color = command.getColor.raw;
    if (command.getLabels !== undefined) {
      data.labels = command.getLabels.map((l) => l.raw);
    }
    if (command.getReminder !== undefined) {
      data.reminder = command.getReminder?.toPlain() ?? null;
    }

    if (Object.keys(data).length > 0) {
      await this.notePersistencePort.update(note.getId, command.getOwner, data);
    }
  }
}
