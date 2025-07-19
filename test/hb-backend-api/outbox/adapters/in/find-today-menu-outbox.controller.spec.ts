import { Test } from "@nestjs/testing";
import { Types } from "mongoose";
import { FindMessageOutboxController } from "../../../../../src/hb-backend-api/outbox/adapters/in/find-message-outbox.controller";
import { FindOutboxByEventTypeAndStatusUseCase } from "../../../../../src/hb-backend-api/outbox/domain/ports/in/find-outbox-by-event-type-and-status.use-case";
import { EventType } from "../../../../../src/hb-backend-api/outbox/domain/model/event-type.enum";
import { OutboxStatus } from "../../../../../src/hb-backend-api/outbox/domain/model/outbox-status.enum";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { OutboxId } from "../../../../../src/hb-backend-api/outbox/domain/model/outbox-id.vo";
import { FindOutboxMessageQueryResult } from "../../../../../src/hb-backend-api/outbox/domain/ports/out/find-outbox-message-query.result";
import { FindOutboxEntity } from "../../../../../src/hb-backend-api/outbox/domain/model/find-outbox.entity";
import { FindMessageOutboxResultDto } from "../../../../../src/hb-backend-api/outbox/adapters/in/find-message-outbox-result.dto";
import { MessageEnum } from "../../../../../src/hb-backend-api/outbox/domain/model/message.enum";

describe("FindMessageOutboxController", () => {
  let controller: FindMessageOutboxController;
  let useCase: FindOutboxByEventTypeAndStatusUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [FindMessageOutboxController],
      providers: [
        {
          provide: DIToken.OutboxModule.FindOutboxByEventTypeAndStatusUseCase,
          useValue: {
            invoke: jest.fn(),
          } as FindOutboxByEventTypeAndStatusUseCase,
        },
      ],
    }).compile();

    controller = module.get(FindMessageOutboxController);
    useCase = module.get(
      DIToken.OutboxModule.FindOutboxByEventTypeAndStatusUseCase,
    );
  });

  it("should return mapped outbox results", async () => {
    const findOutboxEntity = FindOutboxEntity.of({
      id: new OutboxId(new Types.ObjectId()),
      eventId: "event-123",
      eventType: EventType.MESSAGE,
      payload: {
        id: "1",
        title: "today-menu",
        body: "content",
        recipient: "recipient",
        senderId: "senderId",
        type: MessageEnum.MAIL_MESSAGE,
      },
      status: OutboxStatus.PENDING,
      retryCount: 0,
      sentAt: null,
      failedAt: null,
      lastError: null,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const mockFindOutboxQueryResult =
      FindOutboxMessageQueryResult.from(findOutboxEntity);
    (useCase.invoke as jest.Mock).mockResolvedValue([
      mockFindOutboxQueryResult,
    ]);

    const result: { items: FindMessageOutboxResultDto[] } =
      await controller.findBy({
        eventType: EventType.MESSAGE,
        status: OutboxStatus.PENDING,
      });

    expect(result.items.length).toBe(1);
    expect(result.items[0].payload.title).toBe("today-menu");
  });
});
