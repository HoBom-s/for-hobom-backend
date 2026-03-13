import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ExamSetQueryPort } from "../../domain/ports/out/exam-set-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { ExamSetRepository } from "../../domain/repositories/exam-set.repository";
import { ExamSetEntitySchema } from "../../domain/model/exam-set.entity";
import { ExamSetId } from "../../domain/model/exam-set-id.vo";
import { ExamSetDocument } from "../../domain/model/exam-set.schema";

@Injectable()
export class ExamSetQueryAdapter implements ExamSetQueryPort {
  constructor(
    @Inject(DIToken.PrivacyLawModule.ExamSetRepository)
    private readonly examSetRepository: ExamSetRepository,
  ) {}

  public async findAll(): Promise<ExamSetEntitySchema[]> {
    const docs = await this.examSetRepository.findAll();
    if (docs.length === 0) return [];
    return docs.map((doc) => this.toEntity(doc));
  }

  public async findById(id: ExamSetId): Promise<ExamSetEntitySchema> {
    const doc = await this.examSetRepository.findById(id.toString());
    if (!doc) {
      throw new NotFoundException(
        `ExamSet을 찾을 수 없어요. id=${id.toString()}`,
      );
    }
    return this.toEntity(doc);
  }

  private toEntity(doc: ExamSetDocument): ExamSetEntitySchema {
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
}
