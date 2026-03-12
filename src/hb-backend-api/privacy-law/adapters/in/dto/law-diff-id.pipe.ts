import { PipeTransform } from "@nestjs/common";
import { LawDiffId } from "../../../domain/model/law-diff-id.vo";

export class ParseLawDiffIdPipe implements PipeTransform<string, LawDiffId> {
  transform(value: string): LawDiffId {
    return LawDiffId.fromString(value);
  }
}
