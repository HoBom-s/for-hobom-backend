import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { GenerateExamService } from "../../../../../src/hb-backend-api/privacy-law/application/use-cases/generate-exam.service";
import { LawVersionQueryPort } from "../../../../../src/hb-backend-api/privacy-law/domain/ports/out/law-version-query.port";
import { LlmExamPort } from "../../../../../src/hb-backend-api/privacy-law/domain/ports/out/llm-exam.port";
import { ExamSetPersistencePort } from "../../../../../src/hb-backend-api/privacy-law/domain/ports/out/exam-set-persistence.port";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { LawVersionEntitySchema } from "../../../../../src/hb-backend-api/privacy-law/domain/model/law-version.entity";
import { LawVersionId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/law-version-id.vo";
import { LawArticle } from "../../../../../src/hb-backend-api/privacy-law/domain/model/law-article.vo";
import { ExamSetEntitySchema } from "../../../../../src/hb-backend-api/privacy-law/domain/model/exam-set.entity";
import { ExamSetId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/exam-set-id.vo";

describe("GenerateExamService", () => {
  let service: GenerateExamService;
  let lawVersionQueryPort: jest.Mocked<LawVersionQueryPort>;
  let llmExamPort: jest.Mocked<LlmExamPort>;
  let examSetPersistencePort: jest.Mocked<ExamSetPersistencePort>;

  const mockLawVersion = LawVersionEntitySchema.of(
    LawVersionId.fromString(new Types.ObjectId().toHexString()),
    "001",
    "개인정보 보호법",
    "2024-01-01",
    "2024-07-01",
    [
      LawArticle.of("제15조", "개인정보의 수집·이용", "내용", []),
      LawArticle.of("제17조", "개인정보의 제공", "내용", []),
    ],
    "",
    new Date(),
  );

  const mockQuestion = {
    subject: "개인정보 보호법 총칙 및 수집·이용·제공",
    type: "OX",
    question: "테스트 문제",
    choices: [],
    answer: "O",
    explanation: "테스트 해설",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateExamService,
        {
          provide: DIToken.PrivacyLawModule.LawVersionQueryPort,
          useValue: { findLatest: jest.fn() },
        },
        {
          provide: DIToken.PrivacyLawModule.LlmExamPort,
          useValue: { generateExam: jest.fn() },
        },
        {
          provide: DIToken.PrivacyLawModule.ExamSetPersistencePort,
          useValue: { save: jest.fn(), countAll: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(GenerateExamService);
    lawVersionQueryPort = module.get(
      DIToken.PrivacyLawModule.LawVersionQueryPort,
    );
    llmExamPort = module.get(DIToken.PrivacyLawModule.LlmExamPort);
    examSetPersistencePort = module.get(
      DIToken.PrivacyLawModule.ExamSetPersistencePort,
    );
  });

  describe("invoke()", () => {
    it("should throw NotFoundException when no law version exists", async () => {
      lawVersionQueryPort.findLatest.mockResolvedValue(null);

      await expect(service.invoke()).rejects.toThrow(NotFoundException);
    });

    it("should call LLM 3 times with correct batch sizes", async () => {
      lawVersionQueryPort.findLatest.mockResolvedValue(mockLawVersion);
      llmExamPort.generateExam.mockResolvedValue({
        questions: [mockQuestion],
      });
      examSetPersistencePort.countAll.mockResolvedValue(0);
      examSetPersistencePort.save.mockResolvedValue(
        ExamSetEntitySchema.of(
          ExamSetId.fromString(new Types.ObjectId().toHexString()),
          "제1회 CPPG 모의고사",
          1,
          mockLawVersion.getId.toString(),
          3,
          [{ no: 1, ...mockQuestion }],
          new Date(),
        ),
      );

      await service.invoke();

      expect(llmExamPort.generateExam).toHaveBeenCalledTimes(3);

      const calls = llmExamPort.generateExam.mock.calls;
      expect(calls[0][0].questionCount).toBe(34);
      expect(calls[1][0].questionCount).toBe(33);
      expect(calls[2][0].questionCount).toBe(33);
    });

    it("should number questions sequentially starting from 1", async () => {
      lawVersionQueryPort.findLatest.mockResolvedValue(mockLawVersion);
      llmExamPort.generateExam
        .mockResolvedValueOnce({ questions: [mockQuestion, mockQuestion] })
        .mockResolvedValueOnce({ questions: [mockQuestion] })
        .mockResolvedValueOnce({ questions: [mockQuestion] });
      examSetPersistencePort.countAll.mockResolvedValue(0);
      examSetPersistencePort.save.mockImplementation((data) =>
        Promise.resolve(
          ExamSetEntitySchema.of(
            ExamSetId.fromString(new Types.ObjectId().toHexString()),
            data.title,
            data.version,
            data.lawVersionId,
            data.totalQuestions,
            data.questions,
            new Date(),
          ),
        ),
      );

      await service.invoke();

      const savedData = examSetPersistencePort.save.mock.calls[0][0];
      expect(savedData.questions[0].no).toBe(1);
      expect(savedData.questions[1].no).toBe(2);
      expect(savedData.questions[2].no).toBe(3);
      expect(savedData.questions[3].no).toBe(4);
      expect(savedData.totalQuestions).toBe(4);
    });

    it("should auto-increment version based on existing count", async () => {
      lawVersionQueryPort.findLatest.mockResolvedValue(mockLawVersion);
      llmExamPort.generateExam.mockResolvedValue({
        questions: [mockQuestion],
      });
      examSetPersistencePort.countAll.mockResolvedValue(5);
      examSetPersistencePort.save.mockImplementation((data) =>
        Promise.resolve(
          ExamSetEntitySchema.of(
            ExamSetId.fromString(new Types.ObjectId().toHexString()),
            data.title,
            data.version,
            data.lawVersionId,
            data.totalQuestions,
            data.questions,
            new Date(),
          ),
        ),
      );

      await service.invoke();

      const savedData = examSetPersistencePort.save.mock.calls[0][0];
      expect(savedData.version).toBe(6);
      expect(savedData.title).toBe("제6회 CPPG 모의고사");
    });

    it("should filter out questions with invalid type", async () => {
      lawVersionQueryPort.findLatest.mockResolvedValue(mockLawVersion);
      const invalidTypeQuestion = {
        ...mockQuestion,
        type: "INVALID_TYPE",
      };
      llmExamPort.generateExam.mockResolvedValue({
        questions: [mockQuestion, invalidTypeQuestion, mockQuestion],
      });
      examSetPersistencePort.countAll.mockResolvedValue(0);
      examSetPersistencePort.save.mockImplementation((data) =>
        Promise.resolve(
          ExamSetEntitySchema.of(
            ExamSetId.fromString(new Types.ObjectId().toHexString()),
            data.title,
            data.version,
            data.lawVersionId,
            data.totalQuestions,
            data.questions,
            new Date(),
          ),
        ),
      );

      await service.invoke();

      const savedData = examSetPersistencePort.save.mock.calls[0][0];
      expect(savedData.totalQuestions).toBe(6);
    });

    it("should filter out questions with missing required fields", async () => {
      lawVersionQueryPort.findLatest.mockResolvedValue(mockLawVersion);
      const missingFieldQuestion = {
        subject: "",
        type: "OX",
        question: "",
        choices: [],
        answer: "O",
        explanation: "",
      };
      llmExamPort.generateExam.mockResolvedValue({
        questions: [mockQuestion, missingFieldQuestion],
      });
      examSetPersistencePort.countAll.mockResolvedValue(0);
      examSetPersistencePort.save.mockImplementation((data) =>
        Promise.resolve(
          ExamSetEntitySchema.of(
            ExamSetId.fromString(new Types.ObjectId().toHexString()),
            data.title,
            data.version,
            data.lawVersionId,
            data.totalQuestions,
            data.questions,
            new Date(),
          ),
        ),
      );

      await service.invoke();

      const savedData = examSetPersistencePort.save.mock.calls[0][0];
      expect(savedData.totalQuestions).toBe(3);
    });

    it("should throw when all batches produce zero valid questions", async () => {
      lawVersionQueryPort.findLatest.mockResolvedValue(mockLawVersion);
      llmExamPort.generateExam.mockResolvedValue({
        questions: [
          {
            subject: "",
            type: "BAD",
            question: "",
            choices: [],
            answer: "",
            explanation: "",
          },
        ],
      });

      await expect(service.invoke()).rejects.toThrow(
        "모든 배치에서 유효한 문제가 생성되지 않았어요.",
      );
    });

    it("should pass law articles to LLM port", async () => {
      lawVersionQueryPort.findLatest.mockResolvedValue(mockLawVersion);
      llmExamPort.generateExam.mockResolvedValue({
        questions: [mockQuestion],
      });
      examSetPersistencePort.countAll.mockResolvedValue(0);
      examSetPersistencePort.save.mockImplementation((data) =>
        Promise.resolve(
          ExamSetEntitySchema.of(
            ExamSetId.fromString(new Types.ObjectId().toHexString()),
            data.title,
            data.version,
            data.lawVersionId,
            data.totalQuestions,
            data.questions,
            new Date(),
          ),
        ),
      );

      await service.invoke();

      const firstCall = llmExamPort.generateExam.mock.calls[0][0];
      expect(firstCall.articles).toHaveLength(2);
      expect(firstCall.articles[0].articleNo).toBe("제15조");
      expect(firstCall.articles[1].articleNo).toBe("제17조");
    });
  });
});
