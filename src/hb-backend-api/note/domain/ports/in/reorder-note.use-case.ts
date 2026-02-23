import { NoteId } from "../../model/note-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";

export interface ReorderNoteUseCase {
  invoke(id: NoteId, owner: UserId, order: number): Promise<void>;
}
