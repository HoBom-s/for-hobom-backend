import { ExamSetId } from "../../model/exam-set-id.vo";
import { ExamSetEntitySchema } from "../../model/exam-set.entity";

export interface ExamSetQueryPort {
  findAll(): Promise<ExamSetEntitySchema[]>;

  findById(id: ExamSetId): Promise<ExamSetEntitySchema>;
}
