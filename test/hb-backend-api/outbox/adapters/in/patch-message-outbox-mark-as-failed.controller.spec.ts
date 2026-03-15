import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { PatchMessageOutboxMarkAsFailedController } from "../../../../../src/hb-backend-api/outbox/adapters/in/patch-message-outbox-mark-as-failed.controller";
import { PatchOutboxMarkAsFailedUseCase } from "../../../../../src/hb-backend-api/outbox/domain/ports/in/patch-outbox-mark-as-failed.use-case";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { EventId } from "../../../../../src/hb-backend-api/outbox/domain/model/event-id.vo";

describe("PatchMessageOutboxMarkAsFailedController", () => {
  let controller: PatchMessageOutboxMarkAsFailedController;
  let useCase: PatchOutboxMarkAsFailedUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [PatchMessageOutboxMarkAsFailedController],
      providers: [
        {
          provide: DIToken.OutboxModule.PatchOutboxMarkAsFailedUseCase,
          useValue: {
            invoke: jest.fn(),
          } as PatchOutboxMarkAsFailedUseCase,
        },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue("test-api-key") },
        },
      ],
    }).compile();

    controller = module.get(PatchMessageOutboxMarkAsFailedController);
    useCase = module.get(DIToken.OutboxModule.PatchOutboxMarkAsFailedUseCase);
  });

  it("should call use case with eventId and errorMessage", async () => {
    const request = {
      eventId: "event-123",
      errorMessage: "Kafka publish failed",
    };

    await controller.markAsFailed(request);

    expect(useCase.invoke).toHaveBeenCalledTimes(1);
    expect(useCase.invoke).toHaveBeenCalledWith(
      EventId.fromString("event-123"),
      "Kafka publish failed",
    );
  });
});
