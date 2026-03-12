import { Inject, Injectable } from "@nestjs/common";
import { QuestionHistoryQueryPort } from "../../domain/ports/out/question-history-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { QuestionHistoryRepository } from "../../domain/repositories/question-history.repository";
import { QuestionHistoryEntitySchema } from "../../domain/model/question-history.entity";
import { QuestionHistoryDocument } from "../../domain/model/question-history.schema";
import { QuestionHistoryId } from "../../domain/model/question-history-id.vo";

@Injectable()
export class QuestionHistoryQueryAdapter implements QuestionHistoryQueryPort {
  constructor(
    @Inject(DIToken.PrivacyLawModule.QuestionHistoryRepository)
    private readonly questionHistoryRepository: QuestionHistoryRepository,
  ) {}

  public async findAll(): Promise<QuestionHistoryEntitySchema[]> {
    const docs = await this.questionHistoryRepository.findAll();
    if (docs.length === 0) return [];
    return docs.map((doc) => this.toEntity(doc));
  }

  private toEntity(
    doc: QuestionHistoryDocument,
  ): QuestionHistoryEntitySchema {
    return QuestionHistoryEntitySchema.of(
      QuestionHistoryId.fromString(String(doc._id)),
      doc.question,
      doc.answer,
      doc.referencedArticles,
      doc.createdAt,
    );
  }
}
