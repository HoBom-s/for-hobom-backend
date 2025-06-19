import { createTodayMenuPayload } from "../../../../../src/hb-backend-api/outbox/domain/factories/today-menu.payload";

describe("today-menu.payload", () => {
  describe("createTodayMenuPayload()", () => {
    it("should return an today menu payload object", () => {
      const reusult = createTodayMenuPayload({
        todayMenuId: "1",
        name: "today-menu",
      });

      expect(reusult).toStrictEqual({
        todayMenuId: "1",
        name: "today-menu",
      });
    });
  });
});
