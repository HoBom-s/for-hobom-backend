import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { PrivacyLawController } from "../../../../../src/hb-backend-api/privacy-law/adapters/in/privacy-law.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { ExamSetEntitySchema } from "../../../../../src/hb-backend-api/privacy-law/domain/model/exam-set.entity";
import { ExamSetId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/exam-set-id.vo";
import { QuestionHistoryEntitySchema } from "../../../../../src/hb-backend-api/privacy-law/domain/model/question-history.entity";
import { QuestionHistoryId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/question-history-id.vo";

describe("PrivacyLawController", () => {
  let controller: PrivacyLawController;

  const mockExamSet = ExamSetEntitySchema.of(
    ExamSetId.fromString(new Types.ObjectId().toHexString()),
    "제1회 CPPG 모의고사",
    1,
    new Types.ObjectId().toHexString(),
    1,
    [
      {
        no: 1,
        subject: "총칙",
        type: "OX",
        question: "테스트",
        choices: [],
        answer: "O",
        explanation: "해설",
      },
    ],
    new Date(),
  );

  const mockQuestionHistory = QuestionHistoryEntitySchema.of(
    QuestionHistoryId.fromString(new Types.ObjectId().toHexString()),
    "질문",
    "답변",
    ["제15조"],
    new Date(),
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrivacyLawController],
      providers: [
        {
          provide: DIToken.PrivacyLawModule.GetLawVersionsUseCase,
          useValue: { invoke: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: DIToken.PrivacyLawModule.GetLawVersionByIdUseCase,
          useValue: { invoke: jest.fn() },
        },
        {
          provide: DIToken.PrivacyLawModule.GetLawDiffsUseCase,
          useValue: { invoke: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: DIToken.PrivacyLawModule.GetLawDiffByIdUseCase,
          useValue: { invoke: jest.fn() },
        },
        {
          provide: DIToken.PrivacyLawModule.GetStudyMaterialsUseCase,
          useValue: { invoke: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: DIToken.PrivacyLawModule.GetStudyMaterialByIdUseCase,
          useValue: { invoke: jest.fn() },
        },
        {
          provide: DIToken.PrivacyLawModule.AskQuestionUseCase,
          useValue: { invoke: jest.fn() },
        },
        {
          provide: DIToken.PrivacyLawModule.GetQuestionHistoriesUseCase,
          useValue: { invoke: jest.fn() },
        },
        {
          provide: DIToken.PrivacyLawModule.FetchLawVersionUseCase,
          useValue: { invoke: jest.fn() },
        },
        {
          provide: DIToken.PrivacyLawModule.GenerateExamUseCase,
          useValue: { invoke: jest.fn() },
        },
        {
          provide: DIToken.PrivacyLawModule.GetExamSetsUseCase,
          useValue: { invoke: jest.fn() },
        },
        {
          provide: DIToken.PrivacyLawModule.GetExamSetByIdUseCase,
          useValue: { invoke: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(PrivacyLawController);
  });

  describe("generateExam()", () => {
    it("should call generateExamUseCase and return detail DTO", async () => {
      const generateExamUseCase = controller[
        "generateExamUseCase"
      ] as jest.Mocked<{
        invoke: jest.Mock;
      }>;
      generateExamUseCase.invoke.mockResolvedValue(mockExamSet);

      const result = await controller.generateExam();

      expect(result.id).toBe(mockExamSet.getId.toString());
      expect(result.title).toBe("제1회 CPPG 모의고사");
      expect(result.version).toBe(1);
      expect(result.questions).toHaveLength(1);
    });
  });

  describe("getExamSets()", () => {
    it("should return a list of exam set DTOs", async () => {
      const getExamSetsUseCase = controller[
        "getExamSetsUseCase"
      ] as jest.Mocked<{
        invoke: jest.Mock;
      }>;
      getExamSetsUseCase.invoke.mockResolvedValue([mockExamSet]);

      const result = await controller.getExamSets();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockExamSet.getId.toString());
      expect(result[0].title).toBe("제1회 CPPG 모의고사");
      expect("questions" in result[0]).toBe(false);
    });
  });

  describe("getExamSetById()", () => {
    it("should return a detail DTO with questions", async () => {
      const getExamSetByIdUseCase = controller[
        "getExamSetByIdUseCase"
      ] as jest.Mocked<{
        invoke: jest.Mock;
      }>;
      getExamSetByIdUseCase.invoke.mockResolvedValue(mockExamSet);

      const result = await controller.getExamSetById(mockExamSet.getId);

      expect(result.id).toBe(mockExamSet.getId.toString());
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].no).toBe(1);
    });
  });

  describe("askQuestion()", () => {
    it("should call askQuestionUseCase with the question text", async () => {
      const askQuestionUseCase = controller[
        "askQuestionUseCase"
      ] as jest.Mocked<{
        invoke: jest.Mock;
      }>;
      askQuestionUseCase.invoke.mockResolvedValue({
        answer: "답변",
        referencedArticles: ["제15조"],
      });

      const result = await controller.askQuestion({ question: "질문입니다" });

      expect(askQuestionUseCase.invoke).toHaveBeenCalledWith("질문입니다");
      expect(result.answer).toBe("답변");
    });
  });

  describe("getQuestionHistories()", () => {
    it("should return mapped question history DTOs", async () => {
      const getQuestionHistoriesUseCase = controller[
        "getQuestionHistoriesUseCase"
      ] as jest.Mocked<{ invoke: jest.Mock }>;
      getQuestionHistoriesUseCase.invoke.mockResolvedValue([
        mockQuestionHistory,
      ]);

      const result = await controller.getQuestionHistories();

      expect(result).toHaveLength(1);
      expect(result[0].question).toBe("질문");
      expect(result[0].answer).toBe("답변");
    });
  });
});
