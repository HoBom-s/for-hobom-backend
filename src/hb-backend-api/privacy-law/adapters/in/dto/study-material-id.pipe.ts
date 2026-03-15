import { PipeTransform } from "@nestjs/common";
import { StudyMaterialId } from "../../../domain/model/study-material-id.vo";

export class ParseStudyMaterialIdPipe implements PipeTransform<
  string,
  StudyMaterialId
> {
  transform(value: string): StudyMaterialId {
    return StudyMaterialId.fromString(value);
  }
}
