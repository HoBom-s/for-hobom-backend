import { Inject, Injectable } from "@nestjs/common";
import { AskQuestionUseCase } from "../../domain/ports/in/ask-question.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { LlmPort } from "../../domain/ports/out/llm.port";
import { LawVersionQueryPort } from "../../domain/ports/out/law-version-query.port";
import { LawDiffQueryPort } from "../../domain/ports/out/law-diff-query.port";

@Injectable()
export class AskQuestionService implements AskQuestionUseCase {
  constructor(
    @Inject(DIToken.PrivacyLawModule.LlmPort)
    private readonly llmPort: LlmPort,
    @Inject(DIToken.PrivacyLawModule.LawVersionQueryPort)
    private readonly lawVersionQueryPort: LawVersionQueryPort,
    @Inject(DIToken.PrivacyLawModule.LawDiffQueryPort)
    private readonly lawDiffQueryPort: LawDiffQueryPort,
  ) {}

  public async invoke(
    question: string,
  ): Promise<{ answer: string; referencedArticles: string[] }> {
    const latestVersion = await this.lawVersionQueryPort.findLatest();
    if (latestVersion == null) {
      return {
        answer: "아직 법령 데이터가 수집되지 않았어요.",
        referencedArticles: [],
      };
    }

    const articles = latestVersion.getArticles.map((a) => ({
      articleNo: a.getArticleNo,
      articleTitle: a.getTitle,
      content: a.getContent,
    }));

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

    return this.llmPort.ask({ question, articles, recentChanges });
  }
}
