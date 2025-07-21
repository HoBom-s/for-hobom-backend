import { OutboxRepository } from "../../src/hb-backend-api/outbox/infra/repositories/outbox.repository";

export function createOutboxRepository(): jest.Mocked<OutboxRepository> {
  return {
    save: jest.fn(),
    markAsSent: jest.fn(),
    markAsFailed: jest.fn(),
    findByEventTypeAndStatus: jest.fn(),
  };
}
