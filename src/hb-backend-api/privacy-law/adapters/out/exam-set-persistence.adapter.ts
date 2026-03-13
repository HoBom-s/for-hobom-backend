import { Inject, Injectable } from "@nestjs/common";
import { ExamSetPersistencePort } from "../../domain/ports/out/exam-set-persistence.port";
import { DIToken } from "../../../../shared/di/token.di";
import { ExamSetRepository } from "../../domain/repositories/exam-set.repository";
import { ExamSetEntitySchema } from "../../domain/model/exam-set.entity";
import { ExamSetId } from "../../domain/model/exam-set-id.vo";

@Injectable()
export class ExamSetPersistenceAdapter implements ExamSetPersistencePort {
  constructor(
    @Inject(DIToken.PrivacyLawModule.ExamSetRepository)
    private readonly examSetRepository: ExamSetRepository,
  ) {}

  public async save(data: {
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
  }): Promise<ExamSetEntitySchema> {
    const doc = await this.examSetRepository.save(data);
    return ExamSetEntitySchema.of(
      ExamSetId.fromString(String(doc._id)),
      doc.title,
      doc.version,
      String(doc.lawVersionId),
      doc.totalQuestions,
      doc.questions,
      doc.createdAt,
    );
  }

  public async countAll(): Promise<number> {
    return this.examSetRepository.countAll();
  }
}
