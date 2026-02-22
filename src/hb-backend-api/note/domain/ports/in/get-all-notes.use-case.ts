import { UserId } from "../../../../user/domain/model/user-id.vo";
import { NoteStatus } from "../../enums/note-status.enum";
import { NoteQueryResult } from "../out/note-query.result";

export interface GetAllNotesUseCase {
  invoke(owner: UserId, status: NoteStatus): Promise<NoteQueryResult[]>;
}
