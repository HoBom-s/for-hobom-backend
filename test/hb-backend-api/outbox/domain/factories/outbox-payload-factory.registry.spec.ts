import { OutboxPayloadFactoryRegistry } from "../../../../../src/hb-backend-api/outbox/domain/factories/outbox-payload-factory.registry";
import { EventType } from "../../../../../src/hb-backend-api/outbox/domain/enum/event-type.enum";

describe("OutboxPayloadFactoryRegistry", () => {
  it("should generate payload for TODAY_MENU event correctly", () => {
    const input = {
      todayMenuId: "1",
      name: "menu-name",
    };

    const factory = OutboxPayloadFactoryRegistry[EventType.TODAY_MENU];
    expect(factory).toBeDefined();

    const payload = factory(input);
    expect(payload).toEqual({
      todayMenuId: "1",
      name: "menu-name",
    });
  });

  it("should return undefined for unsupported event type (optional)", () => {
    const unsupportedKey = "UNKNOWN_EVENT" as EventType;
    const factory = OutboxPayloadFactoryRegistry[unsupportedKey];

    expect(factory).toBeUndefined();
  });
});
