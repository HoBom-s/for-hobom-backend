import { ExamSetEntitySchema } from "../../model/exam-set.entity";

export interface GetExamSetsUseCase {
  invoke(): Promise<ExamSetEntitySchema[]>;
}
