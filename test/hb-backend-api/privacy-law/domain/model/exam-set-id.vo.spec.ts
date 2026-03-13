import { Types } from "mongoose";
import { ExamSetId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/exam-set-id.vo";

describe("ExamSetId", () => {
  describe("fromString()", () => {
    it("should create an ExamSetId from a valid ObjectId string", () => {
      const objectId = new Types.ObjectId();
      const examSetId = ExamSetId.fromString(objectId.toHexString());

      expect(examSetId.toString()).toBe(objectId.toHexString());
    });

    it("should throw an error for an invalid ObjectId string", () => {
      expect(() => ExamSetId.fromString("invalid-id")).toThrow(
        "올바르지 않은 ExamSet ID 형식이에요.",
      );
    });
  });

  describe("equals()", () => {
    it("should return true for the same ObjectId", () => {
      const hex = new Types.ObjectId().toHexString();
      const a = ExamSetId.fromString(hex);
      const b = ExamSetId.fromString(hex);

      expect(a.equals(b)).toBe(true);
    });

    it("should return false for different ObjectIds", () => {
      const a = ExamSetId.fromString(new Types.ObjectId().toHexString());
      const b = ExamSetId.fromString(new Types.ObjectId().toHexString());

      expect(a.equals(b)).toBe(false);
    });
  });

  describe("raw", () => {
    it("should return the underlying Types.ObjectId", () => {
      const objectId = new Types.ObjectId();
      const examSetId = ExamSetId.fromString(objectId.toHexString());

      expect(examSetId.raw).toBeInstanceOf(Types.ObjectId);
      expect(examSetId.raw.toHexString()).toBe(objectId.toHexString());
    });
  });

  describe("immutability", () => {
    it("should be frozen", () => {
      const examSetId = ExamSetId.fromString(
        new Types.ObjectId().toHexString(),
      );

      expect(Object.isFrozen(examSetId)).toBe(true);
    });
  });
});
