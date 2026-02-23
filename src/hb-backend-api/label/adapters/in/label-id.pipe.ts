import { PipeTransform } from "@nestjs/common";
import { LabelId } from "../../domain/model/label-id.vo";

export class ParseLabelIdPipe implements PipeTransform<string, LabelId> {
  transform(value: string): LabelId {
    return LabelId.fromString(value);
  }
}
