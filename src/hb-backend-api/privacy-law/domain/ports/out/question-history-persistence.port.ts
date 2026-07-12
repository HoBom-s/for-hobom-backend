export interface QuestionHistoryPersistencePort {
  save(data: {
    question: string;
    answer: string;
    referencedArticles: string[];
  }): Promise<void>;
}
