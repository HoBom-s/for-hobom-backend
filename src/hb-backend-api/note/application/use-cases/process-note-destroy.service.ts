import { Inject, Injectable, Logger } from "@nestjs/common";
import { ProcessNoteDestroyUseCase } from "../../domain/ports/in/process-note-destroy.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { NotePersistencePort } from "../../domain/ports/out/note-persistence.port";

@Injectable()
export class ProcessNoteDestroyService implements ProcessNoteDestroyUseCase {
  private readonly logger = new Logger(ProcessNoteDestroyService.name);

  constructor(
    @Inject(DIToken.NoteModule.NotePersistencePort)
    private readonly notePersistencePort: NotePersistencePort,
  ) {}

  public async invoke(): Promise<void> {
    const threshold = new Date();
    threshold.setHours(0, 0, 0, 0);
    threshold.setDate(threshold.getDate() - 7);

    const deletedCount =
      await this.notePersistencePort.deleteTrashedBefore(threshold);

    this.logger.log(`Deleted ${deletedCount} expired trashed notes`);
  }
}
