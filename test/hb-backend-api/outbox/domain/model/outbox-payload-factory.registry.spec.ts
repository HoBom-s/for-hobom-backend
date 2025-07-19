import { OutboxPayloadFactoryRegistry } from "../../../../../src/hb-backend-api/outbox/domain/model/outbox-payload-factory.registry";
import { EventType } from "../../../../../src/hb-backend-api/outbox/domain/model/event-type.enum";
import { MessageEnum } from "../../../../../src/hb-backend-api/outbox/domain/model/message.enum";

describe("OutboxPayloadFactoryRegistry", () => {
  it("should generate payload for TODAY_MENU event correctly", () => {
    const input = {
      id: "1",
      title: "today-menu",
      body: "content",
      recipient: "recipient",
      senderId: "senderId",
      type: MessageEnum.MAIL_MESSAGE,
    };

    const factory = OutboxPayloadFactoryRegistry[EventType.MESSAGE];
    expect(factory).toBeDefined();

    const payload = factory(input);
    expect(payload).toEqual({
      id: "1",
      title: "today-menu",
      body: "content",
      recipient: "recipient",
      senderId: "senderId",
      type: MessageEnum.MAIL_MESSAGE,
    });
  });

  it("should return undefined for unsupported event type (optional)", () => {
    const unsupportedKey = "UNKNOWN_EVENT" as EventType;
    const factory = OutboxPayloadFactoryRegistry[unsupportedKey];

    expect(factory).toBeUndefined();
  });
});
