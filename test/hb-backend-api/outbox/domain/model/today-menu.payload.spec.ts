import { createTodayMenuPayload } from "../../../../../src/hb-backend-api/outbox/domain/model/today-menu.payload";

describe("today-menu.payload", () => {
  describe("createTodayMenuPayload()", () => {
    it("should return an today menu payload object", () => {
      const result = createTodayMenuPayload({
        todayMenuId: "1",
        name: "today-menu",
        username: "user",
        nickname: "nickname",
        email: "email",
        userId: "userId",
      });

      expect(result).toStrictEqual({
        todayMenuId: "1",
        name: "today-menu",
        username: "user",
        nickname: "nickname",
        email: "email",
        userId: "userId",
      });
    });
  });
});
