import { OutboxRepository } from "../../../../../src/hb-backend-api/outbox/infra/repositories/outbox.repository";
import { OutboxPersistenceAdapter } from "../../../../../src/hb-backend-api/outbox/adapters/out/outbox-persistence.adapter";
import { createOutboxRepository } from "../../../../mocks/outbox.repository.mock";
import { CreateOutboxEntity } from "../../../../../src/hb-backend-api/outbox/domain/model/create-outbox.entity";
import { EventType } from "../../../../../src/hb-backend-api/outbox/domain/model/event-type.enum";
import { OutboxPayloadFactoryRegistry } from "../../../../../src/hb-backend-api/outbox/domain/model/outbox-payload-factory.registry";
import { OutboxStatus } from "../../../../../src/hb-backend-api/outbox/domain/model/outbox-status.enum";
import { MessageEnum } from "../../../../../src/hb-backend-api/outbox/domain/model/message.enum";

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
        id: "1",
        title: "today-menu",
        body: "content",
        recipient: "recipient",
        senderId: "senderId",
        type: MessageEnum.MAIL_MESSAGE,
      };
      const factory = OutboxPayloadFactoryRegistry[EventType.MESSAGE];
      const payload = factory(input);
      const entity = CreateOutboxEntity.of(
        EventType.MESSAGE,
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
