import { Inject, Injectable } from "@nestjs/common";
import { CreateNoteUseCase } from "../../domain/ports/in/create-note.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { NotePersistencePort } from "../../domain/ports/out/note-persistence.port";
import { NoteQueryPort } from "../../domain/ports/out/note-query.port";
import { CreateNoteCommand } from "../../domain/ports/out/create-note.command";
import { NoteCreateEntitySchema } from "../../domain/model/note.entity";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class CreateNoteService implements CreateNoteUseCase {
  constructor(
    @Inject(DIToken.NoteModule.NotePersistencePort)
    private readonly notePersistencePort: NotePersistencePort,
    @Inject(DIToken.NoteModule.NoteQueryPort)
    private readonly noteQueryPort: NoteQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(command: CreateNoteCommand): Promise<void> {
    const minOrder = await this.noteQueryPort.findMinOrder(command.getOwner);
    const schema = NoteCreateEntitySchema.of(
      command.getOwner,
      command.getTitle,
      command.getContent,
      command.getType,
      command.getChecklistItems,
      command.getColor,
      command.getLabels,
      command.getReminder,
      minOrder - 1,
    );
    await this.notePersistencePort.save(schema);
  }
}
