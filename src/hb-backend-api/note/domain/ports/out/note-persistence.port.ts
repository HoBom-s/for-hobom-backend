import { NoteCreateEntitySchema } from "../../model/note.entity";
import { NoteId } from "../../model/note-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { NoteStatus } from "../../enums/note-status.enum";

export interface NotePersistencePort {
  save(schema: NoteCreateEntitySchema): Promise<void>;
  update(
    id: NoteId,
    userId: UserId,
    data: Record<string, unknown>,
  ): Promise<void>;
  updateStatus(
    id: NoteId,
    owner: UserId,
    status: NoteStatus,
    trashedAt: Date | null,
  ): Promise<void>;
  togglePin(id: NoteId, userId: UserId, isPinned: boolean): Promise<void>;
  updateOrder(id: NoteId, userId: UserId, order: number): Promise<void>;
  deleteOne(id: NoteId, owner: UserId): Promise<void>;
  deleteTrashedBefore(threshold: Date): Promise<number>;
  emptyTrash(owner: UserId): Promise<void>;
  addMember(id: NoteId, memberUserId: UserId): Promise<void>;
  removeMember(id: NoteId, memberUserId: UserId): Promise<void>;
}
