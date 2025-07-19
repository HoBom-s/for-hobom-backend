import { createMessagePayload } from "../../../../../src/hb-backend-api/outbox/domain/model/message.payload";
import { MessageEnum } from "../../../../../src/hb-backend-api/outbox/domain/model/message.enum";

describe("message.payload", () => {
  describe("createMessagePayload()", () => {
    it("should return an message payload object", () => {
      const result = createMessagePayload({
        id: "1",
        title: "today-menu",
        body: "content",
        recipient: "recipient",
        senderId: "senderId",
        type: MessageEnum.MAIL_MESSAGE,
      });

      expect(result).toStrictEqual({
        id: "1",
        title: "today-menu",
        body: "content",
        recipient: "recipient",
        senderId: "senderId",
        type: MessageEnum.MAIL_MESSAGE,
      });
    });
  });
});
