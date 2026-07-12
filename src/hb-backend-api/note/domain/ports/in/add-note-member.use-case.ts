import { NoteId } from "../../model/note-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";

export interface AddNoteMemberUseCase {
  invoke(noteId: NoteId, userId: UserId, memberUserId: UserId): Promise<void>;
}
