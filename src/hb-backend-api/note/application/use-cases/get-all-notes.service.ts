import { Inject, Injectable } from "@nestjs/common";
import { GetAllNotesUseCase } from "../../domain/ports/in/get-all-notes.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { NoteQueryPort } from "../../domain/ports/out/note-query.port";
import { NoteQueryResult } from "../../domain/ports/out/note-query.result";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { NoteStatus } from "../../domain/enums/note-status.enum";

@Injectable()
export class GetAllNotesService implements GetAllNotesUseCase {
  constructor(
    @Inject(DIToken.NoteModule.NoteQueryPort)
    private readonly noteQueryPort: NoteQueryPort,
  ) {}

  public async invoke(
    owner: UserId,
    status: NoteStatus,
  ): Promise<NoteQueryResult[]> {
    const notes = await this.noteQueryPort.findAll(owner, status);
    if (notes.length === 0) return [];
    return notes.map(NoteQueryResult.from);
  }
}
