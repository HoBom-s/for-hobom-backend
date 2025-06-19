import { OutboxRepository } from "../../src/hb-backend-api/outbox/infra/outbox.repository";

export function createOutboxRepository(): jest.Mocked<OutboxRepository> {
  return {
    save: jest.fn(),
  };
}
