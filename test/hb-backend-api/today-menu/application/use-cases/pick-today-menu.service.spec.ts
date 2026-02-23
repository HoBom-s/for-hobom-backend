import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { PickTodayMenuService } from "../../../../../src/hb-backend-api/today-menu/application/use-cases/pick-today-menu.service";
import { TodayMenuQueryPort } from "../../../../../src/hb-backend-api/today-menu/domain/ports/out/today-menu-query.port";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { TodayMenuId } from "../../../../../src/hb-backend-api/today-menu/domain/model/today-menu.vo";
import { PickTodayMenuCommand } from "../../../../../src/hb-backend-api/today-menu/domain/ports/out/pick-today-menu.command";
import {
  MenuRecommendationRelationEntity,
  RegisterPerson,
} from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-recommendation-with-relations.entity";
import { MenuRecommendationId } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-recommendation-id.vo";
import { MenuKind } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-kind.enum";
import { MenuTimeOfMeal } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-time-of-meal.enum";
import { FoodType } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/food-type.enum";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { YearMonthDayString } from "../../../../../src/hb-backend-api/daily-todo/domain/vo/year-month-day-string.vo";
import { TodayMenuRelationEntity } from "../../../../../src/hb-backend-api/today-menu/domain/model/today-menu-with-relations.entity";
import { TransactionRunner } from "../../../../../src/infra/mongo/transaction/transaction.runner";
import { TodayMenuPersistencePort } from "../../../../../src/hb-backend-api/today-menu/domain/ports/out/today-menu-persistence.port";
import { OutboxPersistencePort } from "../../../../../src/hb-backend-api/outbox/domain/ports/out/outbox-persistence.port";
import { UserQueryPort } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.port";
import { UserEntitySchema } from "../../../../../src/hb-backend-api/user/domain/model/user.entity";

describe("PickTodayMenuService", () => {
  let pickTodayMenuService: PickTodayMenuService;
  let todayMenuQueryPort: jest.Mocked<TodayMenuQueryPort>;
  let todayMenuPersistencePort: jest.Mocked<TodayMenuPersistencePort>;
  let outboxPersistencePort: jest.Mocked<OutboxPersistencePort>;
  let userQueryPort: jest.Mocked<UserQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PickTodayMenuService,
        {
          provide: DIToken.TodayMenuModule.TodayMenuQueryPort,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: DIToken.TodayMenuModule.TodayMenuPersistencePort,
          useValue: {
            upsert: jest.fn(),
          },
        },
        {
          provide: DIToken.OutboxModule.OutboxPersistencePort,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: DIToken.UserModule.UserQueryPort,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: TransactionRunner,
          useValue: {
            run: jest.fn((callback) => callback()),
          },
        },
      ],
    }).compile();

    pickTodayMenuService = module.get(PickTodayMenuService);
    todayMenuQueryPort = module.get(DIToken.TodayMenuModule.TodayMenuQueryPort);
    todayMenuPersistencePort = module.get(
      DIToken.TodayMenuModule.TodayMenuPersistencePort,
    );
    outboxPersistencePort = module.get(
      DIToken.OutboxModule.OutboxPersistencePort,
    );
    userQueryPort = module.get(DIToken.UserModule.UserQueryPort);
  });

  it("should pick a menu from candidates", async () => {
    const todayMenuId = new TodayMenuId(new Types.ObjectId());
    const firstUserId = new UserId(new Types.ObjectId());
    const secondUserId = new UserId(new Types.ObjectId());
    const command = PickTodayMenuCommand.of(todayMenuId);
    const firstMenuId = new MenuRecommendationId(new Types.ObjectId());
    const secondMenuId = new MenuRecommendationId(new Types.ObjectId());
    const menuCandidates = [
      MenuRecommendationRelationEntity.of(
        firstMenuId,
        "된장찌개",
        MenuKind.KOREAN,
        MenuTimeOfMeal.BREAKFAST,
        FoodType.MEAL,
        RegisterPerson.of(firstUserId, "u1", "nick1"),
      ),
      MenuRecommendationRelationEntity.of(
        secondMenuId,
        "비빔밥",
        MenuKind.KOREAN,
        MenuTimeOfMeal.DINNER,
        FoodType.BOTH,
        RegisterPerson.of(secondUserId, "u2", "nick2"),
      ),
    ];
    const todayMenu = TodayMenuRelationEntity.of(
      todayMenuId,
      menuCandidates[0],
      menuCandidates,
      YearMonthDayString.fromString("2025-06-07"),
    );
    const user = UserEntitySchema.of(
      secondUserId,
      "u2",
      "u2@email.com",
      "nick2",
      "password",
      [new Types.ObjectId()],
    );
    userQueryPort.findById.mockResolvedValue(user);
    todayMenuQueryPort.findById.mockResolvedValue(todayMenu);
    // 0.9 * 2 = 1.8 → floor = 1 → "비빔밥"
    jest.spyOn(Math, "random").mockReturnValue(0.9);

    const result = await pickTodayMenuService.invoke(command);

    expect(result).toBe(secondMenuId);
    expect(todayMenuPersistencePort.upsert).toHaveBeenCalledTimes(1);
    expect(userQueryPort.findById).toHaveBeenCalledWith(secondUserId);
    expect(outboxPersistencePort.save).toHaveBeenCalledTimes(1);

    const savedOutbox = outboxPersistencePort.save.mock.calls[0][0];
    expect(savedOutbox.getPayload).toEqual(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        body: expect.stringContaining("비빔밥"),
      }),
    );
  });

  it("should use the same random index for pick and outbox", async () => {
    const todayMenuId = new TodayMenuId(new Types.ObjectId());
    const firstUserId = new UserId(new Types.ObjectId());
    const secondUserId = new UserId(new Types.ObjectId());
    const command = PickTodayMenuCommand.of(todayMenuId);
    const firstMenuId = new MenuRecommendationId(new Types.ObjectId());
    const secondMenuId = new MenuRecommendationId(new Types.ObjectId());
    const menuCandidates = [
      MenuRecommendationRelationEntity.of(
        firstMenuId,
        "된장찌개",
        MenuKind.KOREAN,
        MenuTimeOfMeal.BREAKFAST,
        FoodType.MEAL,
        RegisterPerson.of(firstUserId, "u1", "nick1"),
      ),
      MenuRecommendationRelationEntity.of(
        secondMenuId,
        "비빔밥",
        MenuKind.KOREAN,
        MenuTimeOfMeal.DINNER,
        FoodType.BOTH,
        RegisterPerson.of(secondUserId, "u2", "nick2"),
      ),
    ];
    const todayMenu = TodayMenuRelationEntity.of(
      todayMenuId,
      menuCandidates[0],
      menuCandidates,
      YearMonthDayString.fromString("2025-06-07"),
    );
    const firstUser = UserEntitySchema.of(
      firstUserId,
      "u1",
      "u1@email.com",
      "nick1",
      "password",
      [],
    );
    userQueryPort.findById.mockResolvedValue(firstUser);
    todayMenuQueryPort.findById.mockResolvedValue(todayMenu);
    // 0.1 * 2 = 0.2 → floor = 0 → "된장찌개"
    jest.spyOn(Math, "random").mockReturnValue(0.1);

    const result = await pickTodayMenuService.invoke(command);

    expect(result).toBe(firstMenuId);
    expect(userQueryPort.findById).toHaveBeenCalledWith(firstUserId);

    const savedOutbox = outboxPersistencePort.save.mock.calls[0][0];
    expect(savedOutbox.getPayload).toEqual(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        body: expect.stringContaining("된장찌개"),
      }),
    );
  });

  it("should throw error if no candidates exist", async () => {
    const todayMenuId = new TodayMenuId(new Types.ObjectId());
    const command = PickTodayMenuCommand.of(todayMenuId);

    const emptyTodayMenu = TodayMenuRelationEntity.of(
      todayMenuId,
      null as any,
      [],
      YearMonthDayString.fromString("2025-06-07"),
    );

    todayMenuQueryPort.findById.mockResolvedValue(emptyTodayMenu);

    await expect(pickTodayMenuService.invoke(command)).rejects.toThrow(
      "추첨할 메뉴가 없어요.",
    );
  });
});
