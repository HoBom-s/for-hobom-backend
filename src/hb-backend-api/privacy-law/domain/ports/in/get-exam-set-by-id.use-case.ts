import { ExamSetId } from "../../model/exam-set-id.vo";
import { ExamSetEntitySchema } from "../../model/exam-set.entity";

export interface GetExamSetByIdUseCase {
  invoke(id: ExamSetId): Promise<ExamSetEntitySchema>;
}
