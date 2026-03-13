import { ExamSetEntitySchema } from "../../model/exam-set.entity";

export interface GenerateExamUseCase {
  invoke(): Promise<ExamSetEntitySchema>;
}
