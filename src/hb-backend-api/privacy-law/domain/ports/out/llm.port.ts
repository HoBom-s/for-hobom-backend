export interface LlmPort {
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
