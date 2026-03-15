import { Test } from "@nestjs/testing";
import { PatchOutboxMarkAsFailedService } from "../../../../../src/hb-backend-api/outbox/application/use-cases/patch-outbox-mark-as-failed.service";
import { OutboxPersistencePort } from "../../../../../src/hb-backend-api/outbox/domain/ports/out/outbox-persistence.port";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { TransactionRunner } from "../../../../../src/infra/mongo/transaction/transaction.runner";
import { EventId } from "../../../../../src/hb-backend-api/outbox/domain/model/event-id.vo";

describe("PatchOutboxMarkAsFailedService", () => {
  let service: PatchOutboxMarkAsFailedService;
  let persistencePort: jest.Mocked<OutboxPersistencePort>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PatchOutboxMarkAsFailedService,
        {
          provide: DIToken.OutboxModule.OutboxPersistencePort,
          useValue: {
            markAsFailed: jest.fn(),
          },
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(PatchOutboxMarkAsFailedService);
    persistencePort = module.get(DIToken.OutboxModule.OutboxPersistencePort);
  });

  it("should delegate to persistence port with eventId and errorMessage", async () => {
    const eventId = EventId.fromString("event-456");
    const errorMessage = "Connection timeout";

    await service.invoke(eventId, errorMessage);

    expect(persistencePort.markAsFailed).toHaveBeenCalledTimes(1);
    expect(persistencePort.markAsFailed).toHaveBeenCalledWith(
      eventId,
      "Connection timeout",
    );
  });
});
