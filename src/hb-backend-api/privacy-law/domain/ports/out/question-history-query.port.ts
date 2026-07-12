import { QuestionHistoryEntitySchema } from "../../model/question-history.entity";

export interface QuestionHistoryQueryPort {
  findAll(): Promise<QuestionHistoryEntitySchema[]>;
}
