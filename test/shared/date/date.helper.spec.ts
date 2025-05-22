import { DateHelper } from "../../../src/shared/date/date.helper";

describe("DateHelper", () => {
  describe("formatDate()", () => {
    it("should return date in yyyy-MM-dd format", () => {
      const date = new Date("2025-05-22T15:30:00");
      expect(DateHelper.formatDate(date)).toBe("2025-05-22");
    });
  });

  describe("formatDateTime()", () => {
    it("should return date and time in yyyy-MM-dd HH:mm:ss format", () => {
      const date = new Date("2025-05-22T15:30:45");
      expect(DateHelper.formatDateTime(date)).toBe("2025-05-22 15:30:45");
    });
  });

  describe("format()", () => {
    it("should return formatted string according to format string", () => {
      const date = new Date("2025-01-02T03:04:05");
      expect(DateHelper.format(date, "yyyy/MM/dd HH:mm:ss")).toBe(
        "2025/01/02 03:04:05",
      );
    });
  });

  describe("addDays()", () => {
    it("should add days correctly", () => {
      const date = new Date("2025-01-01");
      const result = DateHelper.addDays(date, 5);
      expect(DateHelper.formatDate(result)).toBe("2025-01-06");
    });
  });

  describe("diffInDays()", () => {
    it("should return the correct day difference", () => {
      const d1 = new Date("2025-01-10");
      const d2 = new Date("2025-01-01");
      expect(DateHelper.diffInDays(d1, d2)).toBe(9);
    });
  });

  describe("startOfDay()", () => {
    it("should reset time to 00:00:00", () => {
      const date = new Date("2025-05-22T15:30:00");
      const start = DateHelper.startOfDay(date);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
    });
  });

  describe("endOfDay()", () => {
    it("should set time to 23:59:59.999", () => {
      const date = new Date("2025-05-22T08:00:00");
      const end = DateHelper.endOfDay(date);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
      expect(end.getMilliseconds()).toBe(999);
    });
  });

  describe("isValid()", () => {
    it("should return true for valid Date", () => {
      expect(DateHelper.isValid(new Date())).toBe(true);
    });

    it("should return false for invalid Date", () => {
      expect(DateHelper.isValid(new Date("invalid"))).toBe(false);
    });
  });

  describe("parse()", () => {
    it("should parse valid yyyy-MM-dd string correctly", () => {
      const date = DateHelper.parse("2025-05-22");
      expect(date instanceof Date).toBe(true);
      expect(DateHelper.formatDate(date)).toBe("2025-05-22");
    });

    it("should throw for invalid format", () => {
      expect(() => DateHelper.parse("22-05-2025")).toThrow(
        "Invalid date string",
      );
    });

    it("should throw for invalid calendar date", () => {
      expect(() => DateHelper.parse("2025-02-30")).toThrow("Invalid date");
    });
  });

  describe("isSameDay()", () => {
    it("should return true for same day", () => {
      const d1 = new Date("2025-05-22T10:00:00");
      const d2 = new Date("2025-05-22T23:59:59");
      expect(DateHelper.isSameDay(d1, d2)).toBe(true);
    });

    it("should return false for different days", () => {
      const d1 = new Date("2025-05-22");
      const d2 = new Date("2025-05-23");
      expect(DateHelper.isSameDay(d1, d2)).toBe(false);
    });
  });
});
