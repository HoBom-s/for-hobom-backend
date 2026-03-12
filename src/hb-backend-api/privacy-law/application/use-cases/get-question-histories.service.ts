import { Inject, Injectable } from "@nestjs/common";
import { GetQuestionHistoriesUseCase } from "../../domain/ports/in/get-question-histories.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { QuestionHistoryQueryPort } from "../../domain/ports/out/question-history-query.port";
import { QuestionHistoryEntitySchema } from "../../domain/model/question-history.entity";

@Injectable()
export class GetQuestionHistoriesService
  implements GetQuestionHistoriesUseCase
{
  constructor(
    @Inject(DIToken.PrivacyLawModule.QuestionHistoryQueryPort)
    private readonly questionHistoryQueryPort: QuestionHistoryQueryPort,
  ) {}

  public async invoke(): Promise<QuestionHistoryEntitySchema[]> {
    return this.questionHistoryQueryPort.findAll();
  }
}
