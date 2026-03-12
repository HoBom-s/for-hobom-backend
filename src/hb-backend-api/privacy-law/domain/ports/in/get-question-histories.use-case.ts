import { QuestionHistoryEntitySchema } from "../../model/question-history.entity";

export interface GetQuestionHistoriesUseCase {
  invoke(): Promise<QuestionHistoryEntitySchema[]>;
}
