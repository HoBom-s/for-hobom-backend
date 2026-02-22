import { PipeTransform } from "@nestjs/common";
import { NoteId } from "../../domain/model/note-id.vo";

export class ParseNoteIdPipe implements PipeTransform<string, NoteId> {
  transform(value: string): NoteId {
    return NoteId.fromString(value);
  }
}
