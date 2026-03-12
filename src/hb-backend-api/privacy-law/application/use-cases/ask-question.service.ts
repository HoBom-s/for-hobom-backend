import { Inject, Injectable } from "@nestjs/common";
import { AskQuestionUseCase } from "../../domain/ports/in/ask-question.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { LlmPort } from "../../domain/ports/out/llm.port";
import { LawVersionQueryPort } from "../../domain/ports/out/law-version-query.port";
import { LawDiffQueryPort } from "../../domain/ports/out/law-diff-query.port";
import { QuestionHistoryPersistencePort } from "../../domain/ports/out/question-history-persistence.port";

@Injectable()
export class AskQuestionService implements AskQuestionUseCase {
  constructor(
    @Inject(DIToken.PrivacyLawModule.LlmPort)
    private readonly llmPort: LlmPort,
    @Inject(DIToken.PrivacyLawModule.LawVersionQueryPort)
    private readonly lawVersionQueryPort: LawVersionQueryPort,
    @Inject(DIToken.PrivacyLawModule.LawDiffQueryPort)
    private readonly lawDiffQueryPort: LawDiffQueryPort,
    @Inject(DIToken.PrivacyLawModule.QuestionHistoryPersistencePort)
    private readonly questionHistoryPersistencePort: QuestionHistoryPersistencePort,
  ) {}

  public async invoke(
    question: string,
  ): Promise<{ answer: string; referencedArticles: string[] }> {
    const latestVersion = await this.lawVersionQueryPort.findLatest();

    const articles =
      latestVersion != null
        ? latestVersion.getArticles.map((a) => ({
            articleNo: a.getArticleNo,
            articleTitle: a.getTitle,
            content: a.getContent,
          }))
        : [];

    const diffs = await this.lawDiffQueryPort.findAll();
    const recentChanges =
      diffs.length > 0
        ? diffs[0].getChanges.map((c) => ({
            articleNo: c.getArticleNo,
            changeType: c.getChangeType,
            before: c.getBefore ?? "",
            after: c.getAfter ?? "",
          }))
        : [];

    const result = await this.llmPort.ask({ question, articles, recentChanges });

    await this.questionHistoryPersistencePort.save({
      question,
      answer: result.answer,
      referencedArticles: result.referencedArticles,
    });

    return result;
  }
}
