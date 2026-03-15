import { Inject, Injectable } from "@nestjs/common";
import { QuestionHistoryPersistencePort } from "../../domain/ports/out/question-history-persistence.port";
import { DIToken } from "../../../../shared/di/token.di";
import { QuestionHistoryRepository } from "../../domain/repositories/question-history.repository";

@Injectable()
export class QuestionHistoryPersistenceAdapter implements QuestionHistoryPersistencePort {
  constructor(
    @Inject(DIToken.PrivacyLawModule.QuestionHistoryRepository)
    private readonly questionHistoryRepository: QuestionHistoryRepository,
  ) {}

  public async save(data: {
    question: string;
    answer: string;
    referencedArticles: string[];
  }): Promise<void> {
    await this.questionHistoryRepository.save(data);
  }
}
