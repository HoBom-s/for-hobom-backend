import { NoteId } from "../../model/note-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { NoteStatus } from "../../enums/note-status.enum";

export interface UpdateNoteStatusUseCase {
  invoke(id: NoteId, owner: UserId, status: NoteStatus): Promise<void>;
}
