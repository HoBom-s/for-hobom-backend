import { NoteId } from "../../model/note-id.vo";
import { UpdateNoteCommand } from "../out/update-note.command";

export interface UpdateNoteUseCase {
  invoke(id: NoteId, command: UpdateNoteCommand): Promise<void>;
}
