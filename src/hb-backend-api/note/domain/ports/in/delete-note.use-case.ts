import { NoteId } from "../../model/note-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";

export interface DeleteNoteUseCase {
  invoke(id: NoteId, owner: UserId): Promise<void>;
}
