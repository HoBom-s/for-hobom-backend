import { ObjectHelper } from "src/shared/object/object.helper";

describe("ObjectHelper", () => {
  describe("isEmpty()", () => {
    it("should return true for an empty object", () => {
      expect(ObjectHelper.isEmpty({})).toBe(true);
    });

    it("should return false for an object with properties", () => {
      expect(ObjectHelper.isEmpty({ key: "value" })).toBe(false);
    });

    it("should return false for an object with multiple properties", () => {
      expect(ObjectHelper.isEmpty({ a: 1, b: 2, c: 3 })).toBe(false);
    });

    it("should return true for an empty array (arrays are objects)", () => {
      expect(ObjectHelper.isEmpty([])).toBe(true);
    });

    it("should return false for a non-empty array", () => {
      expect(ObjectHelper.isEmpty([1])).toBe(false);
    });
  });
});
