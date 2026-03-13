import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { GetQuestionHistoriesService } from "../../../../../src/hb-backend-api/privacy-law/application/use-cases/get-question-histories.service";
import { QuestionHistoryQueryPort } from "../../../../../src/hb-backend-api/privacy-law/domain/ports/out/question-history-query.port";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { QuestionHistoryEntitySchema } from "../../../../../src/hb-backend-api/privacy-law/domain/model/question-history.entity";
import { QuestionHistoryId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/question-history-id.vo";

describe("GetQuestionHistoriesService", () => {
  let service: GetQuestionHistoriesService;
  let questionHistoryQueryPort: jest.Mocked<QuestionHistoryQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetQuestionHistoriesService,
        {
          provide: DIToken.PrivacyLawModule.QuestionHistoryQueryPort,
          useValue: { findAll: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(GetQuestionHistoriesService);
    questionHistoryQueryPort = module.get(
      DIToken.PrivacyLawModule.QuestionHistoryQueryPort,
    );
  });

  describe("invoke()", () => {
    it("should return all question histories", async () => {
      const mockHistories = [
        QuestionHistoryEntitySchema.of(
          QuestionHistoryId.fromString(new Types.ObjectId().toHexString()),
          "질문1",
          "답변1",
          ["제15조"],
          new Date(),
        ),
      ];
      questionHistoryQueryPort.findAll.mockResolvedValue(mockHistories);

      const result = await service.invoke();

      expect(result).toEqual(mockHistories);
      expect(questionHistoryQueryPort.findAll).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no histories exist", async () => {
      questionHistoryQueryPort.findAll.mockResolvedValue([]);

      const result = await service.invoke();

      expect(result).toEqual([]);
    });
  });
});
