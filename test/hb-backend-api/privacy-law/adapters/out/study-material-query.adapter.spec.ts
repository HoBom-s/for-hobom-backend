import { Types } from "mongoose";
import { StudyMaterialQueryAdapter } from "../../../../../src/hb-backend-api/privacy-law/adapters/out/study-material-query.adapter";
import { StudyMaterialRepository } from "../../../../../src/hb-backend-api/privacy-law/domain/repositories/study-material.repository";
import { StudyMaterialEntitySchema } from "../../../../../src/hb-backend-api/privacy-law/domain/model/study-material.entity";
import { StudyMaterialId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/study-material-id.vo";
import { LawDiffId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/law-diff-id.vo";

describe("StudyMaterialQueryAdapter", () => {
  let adapter: StudyMaterialQueryAdapter;
  let repository: jest.Mocked<StudyMaterialRepository>;

  const createMockDoc = (overrides = {}) => ({
    _id: new Types.ObjectId(),
    diffId: new Types.ObjectId(),
    summary: "개인정보 보호법 개정 요약",
    keyPoints: ["핵심 포인트 1", "핵심 포인트 2"],
    quizzes: [
      {
        type: "OX",
        question: "테스트 질문",
        answer: "O",
        explanation: "해설",
        choices: [],
      },
    ],
    ...overrides,
  });

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByDiffId: jest.fn(),
    };
    adapter = new StudyMaterialQueryAdapter(repository);
  });

  describe("findAll()", () => {
    it("should return mapped StudyMaterialEntitySchema array", async () => {
      repository.findAll.mockResolvedValue([createMockDoc()] as never);

      const result = await adapter.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(StudyMaterialEntitySchema);
      expect(result[0].getSummary).toBe("개인정보 보호법 개정 요약");
      expect(result[0].getKeyPoints).toEqual([
        "핵심 포인트 1",
        "핵심 포인트 2",
      ]);
    });

    it("should return empty array when no documents exist", async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await adapter.findAll();

      expect(result).toEqual([]);
    });

    it("should map quizzes correctly", async () => {
      repository.findAll.mockResolvedValue([createMockDoc()] as never);

      const result = await adapter.findAll();

      expect(result[0].getQuizzes).toHaveLength(1);
      expect(result[0].getQuizzes[0].type).toBe("OX");
      expect(result[0].getQuizzes[0].question).toBe("테스트 질문");
    });
  });

  describe("findById()", () => {
    it("should return a StudyMaterialEntitySchema for existing id", async () => {
      const doc = createMockDoc();
      repository.findById.mockResolvedValue(doc as never);

      const id = StudyMaterialId.fromString(doc._id.toHexString());
      const result = await adapter.findById(id);

      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(StudyMaterialEntitySchema);
      expect(result.getSummary).toBe("개인정보 보호법 개정 요약");
    });
  });

  describe("findByDiffId()", () => {
    it("should return a StudyMaterialEntitySchema when found", async () => {
      const doc = createMockDoc();
      repository.findByDiffId.mockResolvedValue(doc as never);

      const diffId = LawDiffId.fromString(new Types.ObjectId().toHexString());
      const result = await adapter.findByDiffId(diffId);

      expect(repository.findByDiffId).toHaveBeenCalledWith(diffId);
      expect(result).toBeInstanceOf(StudyMaterialEntitySchema);
      expect(result!.getKeyPoints).toHaveLength(2);
    });

    it("should return null when no study material for diff", async () => {
      repository.findByDiffId.mockResolvedValue(null);

      const diffId = LawDiffId.fromString(new Types.ObjectId().toHexString());
      const result = await adapter.findByDiffId(diffId);

      expect(result).toBeNull();
    });
  });
});
