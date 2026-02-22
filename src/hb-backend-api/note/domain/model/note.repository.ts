import { NoteCreateEntitySchema } from "./note.entity";
import { NoteId } from "./note-id.vo";
import { NoteDocument } from "./note.schema";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { NoteStatus } from "../enums/note-status.enum";

export interface NoteRepository {
  save(schema: NoteCreateEntitySchema): Promise<void>;
  findById(id: NoteId, owner: UserId): Promise<NoteDocument>;
  findAll(owner: UserId, status: NoteStatus): Promise<NoteDocument[]>;
  update(
    id: NoteId,
    owner: UserId,
    data: Record<string, unknown>,
  ): Promise<void>;
  deleteOne(id: NoteId, owner: UserId): Promise<void>;
  deleteAllTrashed(owner: UserId): Promise<void>;
  findMinOrder(owner: UserId): Promise<number>;
}
