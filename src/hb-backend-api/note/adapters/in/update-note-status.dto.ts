import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { NoteStatus } from "../../domain/enums/note-status.enum";

export class UpdateNoteStatusDto {
  @ApiProperty({ enum: NoteStatus })
  @IsEnum(NoteStatus)
  status: NoteStatus;
}
