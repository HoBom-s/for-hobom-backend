import { PipeTransform, Injectable } from "@nestjs/common";
import { SprintId } from "../../domain/model/sprint-id.vo";

@Injectable()
export class ParseSprintIdPipe implements PipeTransform<string, SprintId> {
  transform(value: string): SprintId {
    return SprintId.fromString(value);
  }
}
