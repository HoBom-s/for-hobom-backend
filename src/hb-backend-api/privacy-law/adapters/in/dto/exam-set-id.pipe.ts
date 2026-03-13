import { PipeTransform } from "@nestjs/common";
import { ExamSetId } from "../../../domain/model/exam-set-id.vo";

export class ParseExamSetIdPipe implements PipeTransform<string, ExamSetId> {
  transform(value: string): ExamSetId {
    return ExamSetId.fromString(value);
  }
}
