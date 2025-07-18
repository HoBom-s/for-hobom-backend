import { Test } from "@nestjs/testing";
import { Types } from "mongoose";
import { FindTodayMenuOutboxController } from "../../../../../src/hb-backend-api/outbox/adapters/in/find-today-menu-outbox.controller";
import { FindOutboxByEventTypeAndStatusUseCase } from "../../../../../src/hb-backend-api/outbox/domain/ports/in/find-outbox-by-event-type-and-status.use-case";
import { EventType } from "../../../../../src/hb-backend-api/outbox/domain/model/event-type.enum";
import { OutboxStatus } from "../../../../../src/hb-backend-api/outbox/domain/model/outbox-status.enum";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { OutboxId } from "../../../../../src/hb-backend-api/outbox/domain/model/outbox-id.vo";
import { FindOutboxMenuQueryResult } from "../../../../../src/hb-backend-api/outbox/domain/ports/out/find-outbox-menu-query.result";
import { FindOutboxEntity } from "../../../../../src/hb-backend-api/outbox/domain/model/find-outbox.entity";
import { FindTodayMenuOutboxResultDto } from "../../../../../src/hb-backend-api/outbox/adapters/in/find-today-menu-outbox-result.dto";

describe("FindTodayMenuOutboxController", () => {
  let controller: FindTodayMenuOutboxController;
  let useCase: FindOutboxByEventTypeAndStatusUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [FindTodayMenuOutboxController],
      providers: [
        {
          provide: DIToken.OutboxModule.FindOutboxByEventTypeAndStatusUseCase,
          useValue: {
            invoke: jest.fn(),
          } as FindOutboxByEventTypeAndStatusUseCase,
        },
      ],
    }).compile();

    controller = module.get(FindTodayMenuOutboxController);
    useCase = module.get(
      DIToken.OutboxModule.FindOutboxByEventTypeAndStatusUseCase,
    );
  });

  it("should return mapped outbox results", async () => {
    const findOutboxEntity = FindOutboxEntity.of({
      id: new OutboxId(new Types.ObjectId()),
      eventId: "event-123",
      eventType: EventType.TODAY_MENU,
      payload: {
        todayMenuId: "menu-1",
        name: "food name",
        username: "user",
        nickname: "nickname",
        email: "email",
        userId: "userId",
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
      FindOutboxMenuQueryResult.from(findOutboxEntity);
    (useCase.invoke as jest.Mock).mockResolvedValue([
      mockFindOutboxQueryResult,
    ]);

    const result: { items: FindTodayMenuOutboxResultDto[] } =
      await controller.findBy({
        eventType: EventType.TODAY_MENU,
        status: OutboxStatus.PENDING,
      });

    expect(result.items.length).toBe(1);
    expect(result.items[0].payload.name).toBe("food name");
  });
});
