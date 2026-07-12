import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { GetExamSetByIdService } from "../../../../../src/hb-backend-api/privacy-law/application/use-cases/get-exam-set-by-id.service";
import { ExamSetQueryPort } from "../../../../../src/hb-backend-api/privacy-law/domain/ports/out/exam-set-query.port";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { ExamSetEntitySchema } from "../../../../../src/hb-backend-api/privacy-law/domain/model/exam-set.entity";
import { ExamSetId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/exam-set-id.vo";

describe("GetExamSetByIdService", () => {
  let service: GetExamSetByIdService;
  let examSetQueryPort: jest.Mocked<ExamSetQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetExamSetByIdService,
        {
          provide: DIToken.PrivacyLawModule.ExamSetQueryPort,
          useValue: { findAll: jest.fn(), findById: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(GetExamSetByIdService);
    examSetQueryPort = module.get(DIToken.PrivacyLawModule.ExamSetQueryPort);
  });

  describe("invoke()", () => {
    it("should return an exam set by id", async () => {
      const examSetId = ExamSetId.fromString(
        new Types.ObjectId().toHexString(),
      );
      const mockExamSet = ExamSetEntitySchema.of(
        examSetId,
        "제1회 CPPG 모의고사",
        1,
        new Types.ObjectId().toHexString(),
        100,
        [
          {
            no: 1,
            subject: "총칙",
            type: "OX",
            question: "문제",
            choices: [],
            answer: "O",
            explanation: "해설",
          },
        ],
        new Date(),
      );
      examSetQueryPort.findById.mockResolvedValue(mockExamSet);

      const result = await service.invoke(examSetId);

      expect(result).toBe(mockExamSet);
      expect(examSetQueryPort.findById).toHaveBeenCalledWith(examSetId);
    });
  });
});
