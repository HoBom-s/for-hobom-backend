import { NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { ExamSetQueryAdapter } from "../../../../../src/hb-backend-api/privacy-law/adapters/out/exam-set-query.adapter";
import { ExamSetRepository } from "../../../../../src/hb-backend-api/privacy-law/domain/repositories/exam-set.repository";
import { ExamSetId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/exam-set-id.vo";

describe("ExamSetQueryAdapter", () => {
  let adapter: ExamSetQueryAdapter;
  let repository: jest.Mocked<ExamSetRepository>;

  const createMockDoc = (overrides = {}) => ({
    _id: new Types.ObjectId(),
    title: "제1회 CPPG 모의고사",
    version: 1,
    lawVersionId: new Types.ObjectId(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      countAll: jest.fn(),
    };
    adapter = new ExamSetQueryAdapter(repository);
  });

  describe("findAll()", () => {
    it("should return mapped ExamSetEntitySchemas", async () => {
      repository.findAll.mockResolvedValue([createMockDoc()] as never);

      const result = await adapter.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].getTitle).toBe("제1회 CPPG 모의고사");
    });

    it("should return empty array when no documents exist", async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await adapter.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("findById()", () => {
    it("should return an ExamSetEntitySchema for existing id", async () => {
      const doc = createMockDoc();
      repository.findById.mockResolvedValue(doc as never);

      const id = ExamSetId.fromString(doc._id.toHexString());
      const result = await adapter.findById(id);

      expect(result.getTitle).toBe("제1회 CPPG 모의고사");
      expect(result.getVersion).toBe(1);
    });

    it("should throw NotFoundException for non-existing id", async () => {
      repository.findById.mockResolvedValue(null);

      const id = ExamSetId.fromString(new Types.ObjectId().toHexString());

      await expect(adapter.findById(id)).rejects.toThrow(NotFoundException);
    });
  });
});
