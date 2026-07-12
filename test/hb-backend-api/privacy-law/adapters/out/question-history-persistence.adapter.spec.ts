import { QuestionHistoryPersistenceAdapter } from "../../../../../src/hb-backend-api/privacy-law/adapters/out/question-history-persistence.adapter";
import { QuestionHistoryRepository } from "../../../../../src/hb-backend-api/privacy-law/domain/repositories/question-history.repository";

describe("QuestionHistoryPersistenceAdapter", () => {
  let adapter: QuestionHistoryPersistenceAdapter;
  let repository: jest.Mocked<QuestionHistoryRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findAll: jest.fn(),
    };
    adapter = new QuestionHistoryPersistenceAdapter(repository);
  });

  describe("save()", () => {
    it("should delegate to repository.save", async () => {
      const data = {
        question: "질문",
        answer: "답변",
        referencedArticles: ["제15조"],
      };
      repository.save.mockResolvedValue(undefined);

      await adapter.save(data);

      expect(repository.save).toHaveBeenCalledWith(data);
    });
  });
});
