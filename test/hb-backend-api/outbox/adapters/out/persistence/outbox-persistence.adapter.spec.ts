import { OutboxRepository } from "../../../../../../src/hb-backend-api/outbox/infra/repositories/outbox.repository";
import { OutboxPersistenceAdapter } from "../../../../../../src/hb-backend-api/outbox/adapters/out/persistence/outbox-persistence.adapter";
import { createOutboxRepository } from "../../../../../mocks/outbox.repository.mock";
import { CreateOutboxEntity } from "../../../../../../src/hb-backend-api/outbox/domain/entity/create-outbox.entity";
import { EventType } from "../../../../../../src/hb-backend-api/outbox/domain/enum/event-type.enum";
import { OutboxPayloadFactoryRegistry } from "../../../../../../src/hb-backend-api/outbox/domain/factories/outbox-payload-factory.registry";
import { OutboxStatus } from "../../../../../../src/hb-backend-api/outbox/domain/enum/outbox-status.enum";

describe("OutboxPersistenceAdapter", () => {
  let outboxRepository: jest.Mocked<OutboxRepository>;
  let outboxPersistenceAdapter: OutboxPersistenceAdapter;

  beforeEach(() => {
    outboxRepository = createOutboxRepository();
    outboxPersistenceAdapter = new OutboxPersistenceAdapter(outboxRepository);
  });

  describe("save()", () => {
    it("should call outboxPersistenceAdapter.save with the given entity", async () => {
      const input = {
        todayMenuId: "1",
        name: "menu-name",
      };
      const factory = OutboxPayloadFactoryRegistry[EventType.TODAY_MENU];
      const payload = factory(input);
      const entity = CreateOutboxEntity.of(
        EventType.TODAY_MENU,
        payload,
        OutboxStatus.PENDING,
        1,
        1,
      );

      await outboxPersistenceAdapter.save(entity);

      expect(outboxRepository.save).toHaveBeenCalledTimes(1);
      expect(outboxRepository.save).toHaveBeenCalledWith(entity);
    });
  });
});
