import { ExamSetDocument } from "../model/exam-set.schema";

export interface ExamSetRepository {
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
  }): Promise<ExamSetDocument>;

  findAll(): Promise<ExamSetDocument[]>;

  findById(id: string): Promise<ExamSetDocument | null>;

  countAll(): Promise<number>;
}
