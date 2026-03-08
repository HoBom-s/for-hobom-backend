import { NoteId } from "../../model/note-id.vo";
import { NoteEntitySchema } from "../../model/note.entity";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { NoteStatus } from "../../enums/note-status.enum";

export interface NoteQueryPort {
  findById(id: NoteId, userId: UserId): Promise<NoteEntitySchema>;
  findAll(userId: UserId, status: NoteStatus): Promise<NoteEntitySchema[]>;
  findMinOrder(userId: UserId): Promise<number>;
}
