import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { GetExamSetsService } from "../../../../../src/hb-backend-api/privacy-law/application/use-cases/get-exam-sets.service";
import { ExamSetQueryPort } from "../../../../../src/hb-backend-api/privacy-law/domain/ports/out/exam-set-query.port";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { ExamSetEntitySchema } from "../../../../../src/hb-backend-api/privacy-law/domain/model/exam-set.entity";
import { ExamSetId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/exam-set-id.vo";

describe("GetExamSetsService", () => {
  let service: GetExamSetsService;
  let examSetQueryPort: jest.Mocked<ExamSetQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetExamSetsService,
        {
          provide: DIToken.PrivacyLawModule.ExamSetQueryPort,
          useValue: { findAll: jest.fn(), findById: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(GetExamSetsService);
    examSetQueryPort = module.get(DIToken.PrivacyLawModule.ExamSetQueryPort);
  });

  describe("invoke()", () => {
    it("should return all exam sets from query port", async () => {
      const mockExamSets = [
        ExamSetEntitySchema.of(
          ExamSetId.fromString(new Types.ObjectId().toHexString()),
          "제1회 CPPG 모의고사",
          1,
          new Types.ObjectId().toHexString(),
          100,
          [],
          new Date(),
        ),
      ];
      examSetQueryPort.findAll.mockResolvedValue(mockExamSets);

      const result = await service.invoke();

      expect(result).toEqual(mockExamSets);
      expect(examSetQueryPort.findAll).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no exam sets exist", async () => {
      examSetQueryPort.findAll.mockResolvedValue([]);

      const result = await service.invoke();

      expect(result).toEqual([]);
    });
  });
});
