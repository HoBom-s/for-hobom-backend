import { PipeTransform } from "@nestjs/common";
import { BoardId } from "../../domain/model/board-id.vo";

export class ParseBoardIdPipe implements PipeTransform<string, BoardId> {
  transform(value: string): BoardId {
    return BoardId.fromString(value);
  }
}
