import { Types } from "mongoose";
import { QuestionHistoryId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/question-history-id.vo";

describe("QuestionHistoryId", () => {
  describe("fromString()", () => {
    it("should create a QuestionHistoryId from a valid ObjectId string", () => {
      const objectId = new Types.ObjectId();
      const id = QuestionHistoryId.fromString(objectId.toHexString());

      expect(id.toString()).toBe(objectId.toHexString());
    });

    it("should throw an error for an invalid ObjectId string", () => {
      expect(() => QuestionHistoryId.fromString("bad")).toThrow(
        "올바르지 않은 QuestionHistory ID 형식이에요.",
      );
    });
  });

  describe("equals()", () => {
    it("should return true for the same ObjectId", () => {
      const hex = new Types.ObjectId().toHexString();
      const a = QuestionHistoryId.fromString(hex);
      const b = QuestionHistoryId.fromString(hex);

      expect(a.equals(b)).toBe(true);
    });

    it("should return false for different ObjectIds", () => {
      const a = QuestionHistoryId.fromString(
        new Types.ObjectId().toHexString(),
      );
      const b = QuestionHistoryId.fromString(
        new Types.ObjectId().toHexString(),
      );

      expect(a.equals(b)).toBe(false);
    });
  });

  describe("immutability", () => {
    it("should be frozen", () => {
      const id = QuestionHistoryId.fromString(
        new Types.ObjectId().toHexString(),
      );

      expect(Object.isFrozen(id)).toBe(true);
    });
  });
});
