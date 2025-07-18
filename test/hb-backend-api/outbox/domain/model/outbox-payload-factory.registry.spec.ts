import { OutboxPayloadFactoryRegistry } from "../../../../../src/hb-backend-api/outbox/domain/model/outbox-payload-factory.registry";
import { EventType } from "../../../../../src/hb-backend-api/outbox/domain/model/event-type.enum";

describe("OutboxPayloadFactoryRegistry", () => {
  it("should generate payload for TODAY_MENU event correctly", () => {
    const input = {
      todayMenuId: "1",
      name: "menu-name",
      username: "user",
      nickname: "nickname",
      email: "email",
      userId: "userId",
    };

    const factory = OutboxPayloadFactoryRegistry[EventType.TODAY_MENU];
    expect(factory).toBeDefined();

    const payload = factory(input);
    expect(payload).toEqual({
      todayMenuId: "1",
      name: "menu-name",
      username: "user",
      nickname: "nickname",
      email: "email",
      userId: "userId",
    });
  });

  it("should return undefined for unsupported event type (optional)", () => {
    const unsupportedKey = "UNKNOWN_EVENT" as EventType;
    const factory = OutboxPayloadFactoryRegistry[unsupportedKey];

    expect(factory).toBeUndefined();
  });
});
