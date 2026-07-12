import { Types } from "mongoose";
import { QuestionHistoryQueryAdapter } from "../../../../../src/hb-backend-api/privacy-law/adapters/out/question-history-query.adapter";
import { QuestionHistoryRepository } from "../../../../../src/hb-backend-api/privacy-law/domain/repositories/question-history.repository";

describe("QuestionHistoryQueryAdapter", () => {
  let adapter: QuestionHistoryQueryAdapter;
  let repository: jest.Mocked<QuestionHistoryRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findAll: jest.fn(),
    };
    adapter = new QuestionHistoryQueryAdapter(repository);
  });

  describe("findAll()", () => {
    it("should return mapped QuestionHistoryEntitySchemas", async () => {
      const mockDocs = [
        {
          _id: new Types.ObjectId(),
          question: "질문",
          answer: "답변",
          referencedArticles: ["제15조"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      repository.findAll.mockResolvedValue(mockDocs as never);

      const result = await adapter.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].getQuestion).toBe("질문");
      expect(result[0].getAnswer).toBe("답변");
    });

    it("should return empty array when no documents exist", async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await adapter.findAll();

      expect(result).toEqual([]);
    });
  });
});
