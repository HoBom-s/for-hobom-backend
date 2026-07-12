export interface LlmExamPort {
  generateExam(request: {
    articles: { articleNo: string; articleTitle: string; content: string }[];
    subject: string;
    questionCount: number;
  }): Promise<{
    questions: {
      subject: string;
      type: string;
      question: string;
      choices: string[];
      answer: string;
      explanation: string;
    }[];
  }>;
}
