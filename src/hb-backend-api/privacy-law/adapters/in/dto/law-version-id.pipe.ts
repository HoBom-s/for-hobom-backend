import { PipeTransform } from "@nestjs/common";
import { LawVersionId } from "../../../domain/model/law-version-id.vo";

export class ParseLawVersionIdPipe
  implements PipeTransform<string, LawVersionId>
{
  transform(value: string): LawVersionId {
    return LawVersionId.fromString(value);
  }
}
