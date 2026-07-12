export interface StudyMaterialPersistencePort {
  save(data: {
    diffId: string;
    summary: string;
    keyPoints: string[];
    quizzes: {
      type: string;
      question: string;
      answer: string;
      explanation: string;
      choices: string[];
    }[];
  }): Promise<void>;
}
