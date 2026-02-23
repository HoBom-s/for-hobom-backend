import { NoteCreateEntitySchema } from "../../model/note.entity";
import { NoteId } from "../../model/note-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { NoteStatus } from "../../enums/note-status.enum";

export interface NotePersistencePort {
  save(schema: NoteCreateEntitySchema): Promise<void>;
  update(
    id: NoteId,
    owner: UserId,
    data: Record<string, unknown>,
  ): Promise<void>;
  updateStatus(
    id: NoteId,
    owner: UserId,
    status: NoteStatus,
    trashedAt: Date | null,
  ): Promise<void>;
  togglePin(id: NoteId, owner: UserId, isPinned: boolean): Promise<void>;
  updateOrder(id: NoteId, owner: UserId, order: number): Promise<void>;
  deleteOne(id: NoteId, owner: UserId): Promise<void>;
  emptyTrash(owner: UserId): Promise<void>;
}
