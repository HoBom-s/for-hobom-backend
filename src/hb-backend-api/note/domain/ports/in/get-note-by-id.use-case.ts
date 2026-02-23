import { NoteId } from "../../model/note-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { NoteQueryResult } from "../out/note-query.result";

export interface GetNoteByIdUseCase {
  invoke(id: NoteId, owner: UserId): Promise<NoteQueryResult>;
}
