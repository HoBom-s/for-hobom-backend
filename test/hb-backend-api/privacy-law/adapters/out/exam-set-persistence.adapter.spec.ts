import { Types } from "mongoose";
import { ExamSetPersistenceAdapter } from "../../../../../src/hb-backend-api/privacy-law/adapters/out/exam-set-persistence.adapter";
import { ExamSetRepository } from "../../../../../src/hb-backend-api/privacy-law/domain/repositories/exam-set.repository";

describe("ExamSetPersistenceAdapter", () => {
  let adapter: ExamSetPersistenceAdapter;
  let repository: jest.Mocked<ExamSetRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      countAll: jest.fn(),
    };
    adapter = new ExamSetPersistenceAdapter(repository);
  });

  describe("save()", () => {
    it("should call repository.save and return an ExamSetEntitySchema", async () => {
      const data = {
        title: "제1회 CPPG 모의고사",
        version: 1,
        lawVersionId: new Types.ObjectId().toHexString(),
        totalQuestions: 1,
        questions: [
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
      };

      const mockDoc = {
        _id: new Types.ObjectId(),
        ...data,
        lawVersionId: new Types.ObjectId(data.lawVersionId),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repository.save.mockResolvedValue(mockDoc as never);

      const result = await adapter.save(data);

      expect(repository.save).toHaveBeenCalledWith(data);
      expect(result.getTitle).toBe("제1회 CPPG 모의고사");
      expect(result.getVersion).toBe(1);
      expect(result.getTotalQuestions).toBe(1);
    });
  });

  describe("countAll()", () => {
    it("should delegate to repository.countAll", async () => {
      repository.countAll.mockResolvedValue(5);

      const result = await adapter.countAll();

      expect(result).toBe(5);
      expect(repository.countAll).toHaveBeenCalledTimes(1);
    });
  });
});
