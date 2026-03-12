export interface LlmPort {
  generateStudyMaterial(
    changes: {
      articleNo: string;
      changeType: string;
      before: string;
      after: string;
    }[],
  ): Promise<{
    summary: string;
    keyPoints: string[];
    quizzes: {
      type: string;
      question: string;
      answer: string;
      explanation: string;
      choices: string[];
    }[];
  }>;

  ask(request: {
    question: string;
    articles: {
      articleNo: string;
      articleTitle: string;
      content: string;
    }[];
    recentChanges: {
      articleNo: string;
      changeType: string;
      before: string;
      after: string;
    }[];
  }): Promise<{ answer: string; referencedArticles: string[] }>;
}
