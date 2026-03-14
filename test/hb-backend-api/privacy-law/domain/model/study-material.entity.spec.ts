import { Types } from "mongoose";
import { StudyMaterialEntitySchema } from "src/hb-backend-api/privacy-law/domain/model/study-material.entity";
import { StudyMaterialId } from "src/hb-backend-api/privacy-law/domain/model/study-material-id.vo";
import { LawDiffId } from "src/hb-backend-api/privacy-law/domain/model/law-diff-id.vo";

const makeStudyMaterialId = () => new StudyMaterialId(new Types.ObjectId());
const makeLawDiffId = () => new LawDiffId(new Types.ObjectId());

const makeQuiz = (
  overrides: Partial<{
    type: string;
    question: string;
    answer: string;
    explanation: string;
    choices: string[];
  }> = {},
) => ({
  type: overrides.type ?? "OX",
  question: overrides.question ?? "개인정보란?",
  answer: overrides.answer ?? "O",
  explanation: overrides.explanation ?? "개인정보보호법 제2조",
  choices: overrides.choices ?? [],
});

describe("StudyMaterialEntitySchema", () => {
  describe("of()", () => {
    it("should create a StudyMaterialEntitySchema with all fields", () => {
      const id = makeStudyMaterialId();
      const diffId = makeLawDiffId();
      const summary = "법률 요약 내용";
      const keyPoints = ["핵심 포인트 1", "핵심 포인트 2"];
      const quizzes = [makeQuiz()];

      const schema = StudyMaterialEntitySchema.of(
        id,
        diffId,
        summary,
        keyPoints,
        quizzes,
      );

      expect(schema.getId).toBe(id);
      expect(schema.getDiffId).toBe(diffId);
      expect(schema.getSummary).toBe(summary);
      expect(schema.getKeyPoints).toEqual(keyPoints);
      expect(schema.getQuizzes).toEqual(quizzes);
    });

    it("should handle empty keyPoints and quizzes", () => {
      const schema = StudyMaterialEntitySchema.of(
        makeStudyMaterialId(),
        makeLawDiffId(),
        "요약",
        [],
        [],
      );

      expect(schema.getKeyPoints).toEqual([]);
      expect(schema.getQuizzes).toEqual([]);
    });

    it("should handle multiple quizzes", () => {
      const quizzes = [
        makeQuiz({ type: "OX", answer: "O" }),
        makeQuiz({ type: "MC", answer: "2", choices: ["A", "B", "C", "D"] }),
      ];

      const schema = StudyMaterialEntitySchema.of(
        makeStudyMaterialId(),
        makeLawDiffId(),
        "요약",
        ["포인트"],
        quizzes,
      );

      expect(schema.getQuizzes).toHaveLength(2);
      expect(schema.getQuizzes[1].choices).toEqual(["A", "B", "C", "D"]);
    });
  });

  describe("StudyMaterialId", () => {
    it("should create from valid string", () => {
      const objectId = new Types.ObjectId();
      const id = StudyMaterialId.fromString(objectId.toHexString());

      expect(id.toString()).toBe(objectId.toHexString());
    });

    it("should throw on invalid string", () => {
      expect(() => StudyMaterialId.fromString("invalid")).toThrow();
    });

    it("should support equals()", () => {
      const objectId = new Types.ObjectId();
      const id1 = new StudyMaterialId(objectId);
      const id2 = new StudyMaterialId(objectId);

      expect(id1.equals(id2)).toBe(true);
    });

    it("should return false for different ids", () => {
      const id1 = new StudyMaterialId(new Types.ObjectId());
      const id2 = new StudyMaterialId(new Types.ObjectId());

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe("LawDiffId", () => {
    it("should create from valid string", () => {
      const objectId = new Types.ObjectId();
      const id = LawDiffId.fromString(objectId.toHexString());

      expect(id.toString()).toBe(objectId.toHexString());
    });

    it("should throw on invalid string", () => {
      expect(() => LawDiffId.fromString("invalid")).toThrow();
    });

    it("should support equals()", () => {
      const objectId = new Types.ObjectId();
      const id1 = new LawDiffId(objectId);
      const id2 = new LawDiffId(objectId);

      expect(id1.equals(id2)).toBe(true);
    });
  });
});
