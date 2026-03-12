import { QuestionHistoryDocument } from "../model/question-history.schema";

export interface QuestionHistoryRepository {
  save(data: {
    question: string;
    answer: string;
    referencedArticles: string[];
  }): Promise<void>;
  findAll(): Promise<QuestionHistoryDocument[]>;
}
