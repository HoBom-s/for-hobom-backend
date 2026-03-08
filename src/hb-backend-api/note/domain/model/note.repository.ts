import { NoteCreateEntitySchema } from "./note.entity";
import { NoteId } from "./note-id.vo";
import { NoteDocument } from "./note.schema";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { NoteStatus } from "../enums/note-status.enum";

export interface NoteRepository {
  save(schema: NoteCreateEntitySchema): Promise<void>;
  findById(id: NoteId, userId: UserId): Promise<NoteDocument>;
  findAll(userId: UserId, status: NoteStatus): Promise<NoteDocument[]>;
  update(
    id: NoteId,
    userId: UserId,
    data: Record<string, unknown>,
  ): Promise<void>;
  deleteOne(id: NoteId, owner: UserId): Promise<void>;
  deleteAllTrashed(owner: UserId): Promise<void>;
  deleteTrashedBefore(threshold: Date): Promise<number>;
  findMinOrder(userId: UserId): Promise<number>;
  addMember(id: NoteId, memberUserId: UserId): Promise<void>;
  removeMember(id: NoteId, memberUserId: UserId): Promise<void>;
}
