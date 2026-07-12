import { NoteId } from "../../model/note-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";

export interface ToggleNotePinUseCase {
  invoke(id: NoteId, userId: UserId): Promise<void>;
}
