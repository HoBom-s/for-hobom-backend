import { CreateNoteCommand } from "../out/create-note.command";

export interface CreateNoteUseCase {
  invoke(command: CreateNoteCommand): Promise<void>;
}
