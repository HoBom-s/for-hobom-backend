import { Inject, Injectable } from "@nestjs/common";
import { GetNoteByIdUseCase } from "../../domain/ports/in/get-note-by-id.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { NoteQueryPort } from "../../domain/ports/out/note-query.port";
import { NoteId } from "../../domain/model/note-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { NoteQueryResult } from "../../domain/ports/out/note-query.result";

@Injectable()
export class GetNoteByIdService implements GetNoteByIdUseCase {
  constructor(
    @Inject(DIToken.NoteModule.NoteQueryPort)
    private readonly noteQueryPort: NoteQueryPort,
  ) {}

  public async invoke(id: NoteId, owner: UserId): Promise<NoteQueryResult> {
    const note = await this.noteQueryPort.findById(id, owner);
    return NoteQueryResult.from(note);
  }
}
