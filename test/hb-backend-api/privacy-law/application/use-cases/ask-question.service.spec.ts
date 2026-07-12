import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { AskQuestionService } from "../../../../../src/hb-backend-api/privacy-law/application/use-cases/ask-question.service";
import { LlmPort } from "../../../../../src/hb-backend-api/privacy-law/domain/ports/out/llm.port";
import { LawVersionQueryPort } from "../../../../../src/hb-backend-api/privacy-law/domain/ports/out/law-version-query.port";
import { LawDiffQueryPort } from "../../../../../src/hb-backend-api/privacy-law/domain/ports/out/law-diff-query.port";
import { QuestionHistoryPersistencePort } from "../../../../../src/hb-backend-api/privacy-law/domain/ports/out/question-history-persistence.port";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { LawVersionEntitySchema } from "../../../../../src/hb-backend-api/privacy-law/domain/model/law-version.entity";
import { LawVersionId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/law-version-id.vo";
import { LawArticle } from "../../../../../src/hb-backend-api/privacy-law/domain/model/law-article.vo";
import { LawDiffEntitySchema } from "../../../../../src/hb-backend-api/privacy-law/domain/model/law-diff.entity";
import { LawDiffId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/law-diff-id.vo";
import { ArticleChange } from "../../../../../src/hb-backend-api/privacy-law/domain/model/article-change.vo";
import { ChangeType } from "../../../../../src/hb-backend-api/privacy-law/domain/enums/change-type.enum";

describe("AskQuestionService", () => {
  let service: AskQuestionService;
  let llmPort: jest.Mocked<LlmPort>;
  let lawVersionQueryPort: jest.Mocked<LawVersionQueryPort>;
  let lawDiffQueryPort: jest.Mocked<LawDiffQueryPort>;
  let questionHistoryPersistencePort: jest.Mocked<QuestionHistoryPersistencePort>;

  const mockLawVersion = LawVersionEntitySchema.of(
    LawVersionId.fromString(new Types.ObjectId().toHexString()),
    "001",
    "개인정보 보호법",
    "2024-01-01",
    "2024-07-01",
    [LawArticle.of("제15조", "개인정보의 수집·이용", "내용", [])],
    "",
    new Date(),
  );

  const mockDiff = LawDiffEntitySchema.of(
    LawDiffId.fromString(new Types.ObjectId().toHexString()),
    LawVersionId.fromString(new Types.ObjectId().toHexString()),
    LawVersionId.fromString(new Types.ObjectId().toHexString()),
    "2023-01-01",
    "2024-01-01",
    [ArticleChange.of("제15조", ChangeType.MODIFIED, "이전 내용", "변경 내용")],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AskQuestionService,
        {
          provide: DIToken.PrivacyLawModule.LlmPort,
          useValue: { ask: jest.fn() },
        },
        {
          provide: DIToken.PrivacyLawModule.LawVersionQueryPort,
          useValue: { findLatest: jest.fn() },
        },
        {
          provide: DIToken.PrivacyLawModule.LawDiffQueryPort,
          useValue: { findAll: jest.fn() },
        },
        {
          provide: DIToken.PrivacyLawModule.QuestionHistoryPersistencePort,
          useValue: { save: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AskQuestionService);
    llmPort = module.get(DIToken.PrivacyLawModule.LlmPort);
    lawVersionQueryPort = module.get(
      DIToken.PrivacyLawModule.LawVersionQueryPort,
    );
    lawDiffQueryPort = module.get(DIToken.PrivacyLawModule.LawDiffQueryPort);
    questionHistoryPersistencePort = module.get(
      DIToken.PrivacyLawModule.QuestionHistoryPersistencePort,
    );
  });

  describe("invoke()", () => {
    it("should ask LLM with articles and recent changes", async () => {
      lawVersionQueryPort.findLatest.mockResolvedValue(mockLawVersion);
      lawDiffQueryPort.findAll.mockResolvedValue([mockDiff]);
      llmPort.ask.mockResolvedValue({
        answer: "답변입니다",
        referencedArticles: ["제15조"],
      });
      questionHistoryPersistencePort.save.mockResolvedValue(undefined);

      const result = await service.invoke("개인정보 수집 동의란?");

      expect(result.answer).toBe("답변입니다");
      expect(result.referencedArticles).toEqual(["제15조"]);

      const llmCall = llmPort.ask.mock.calls[0][0];
      expect(llmCall.question).toBe("개인정보 수집 동의란?");
      expect(llmCall.articles).toHaveLength(1);
      expect(llmCall.articles[0].articleNo).toBe("제15조");
      expect(llmCall.recentChanges).toHaveLength(1);
    });

    it("should pass empty articles when no law version exists", async () => {
      lawVersionQueryPort.findLatest.mockResolvedValue(null);
      lawDiffQueryPort.findAll.mockResolvedValue([]);
      llmPort.ask.mockResolvedValue({
        answer: "일반 지식 답변",
        referencedArticles: [],
      });
      questionHistoryPersistencePort.save.mockResolvedValue(undefined);

      await service.invoke("질문");

      const llmCall = llmPort.ask.mock.calls[0][0];
      expect(llmCall.articles).toEqual([]);
      expect(llmCall.recentChanges).toEqual([]);
    });

    it("should save question history after getting answer", async () => {
      lawVersionQueryPort.findLatest.mockResolvedValue(null);
      lawDiffQueryPort.findAll.mockResolvedValue([]);
      llmPort.ask.mockResolvedValue({
        answer: "답변",
        referencedArticles: ["제17조"],
      });
      questionHistoryPersistencePort.save.mockResolvedValue(undefined);

      await service.invoke("테스트 질문");

      expect(questionHistoryPersistencePort.save).toHaveBeenCalledWith({
        question: "테스트 질문",
        answer: "답변",
        referencedArticles: ["제17조"],
      });
    });
  });
});
