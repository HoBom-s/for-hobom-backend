import { ExamSetEntitySchema } from "../../model/exam-set.entity";

export interface ExamSetPersistencePort {
  save(data: {
    title: string;
    version: number;
    lawVersionId: string;
    totalQuestions: number;
    questions: {
      no: number;
      subject: string;
      type: string;
      question: string;
      choices: string[];
      answer: string;
      explanation: string;
    }[];
  }): Promise<ExamSetEntitySchema>;

  countAll(): Promise<number>;
}
