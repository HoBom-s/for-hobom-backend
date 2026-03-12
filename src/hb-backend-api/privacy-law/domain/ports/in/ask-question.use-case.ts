export interface AskQuestionUseCase {
  invoke(
    question: string,
  ): Promise<{ answer: string; referencedArticles: string[] }>;
}
