import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { FindTodayMenuByIdService } from "../../../../../src/hb-backend-api/today-menu/application/use-cases/find-today-menu-by-id.service";
import { UpsertTodayMenuService } from "../../../../../src/hb-backend-api/today-menu/application/use-cases/upsert-today-menu.service";
import { TodayMenuQueryPort } from "../../../../../src/hb-backend-api/today-menu/domain/ports/out/today-menu-query.port";
import { TodayMenuPersistencePort } from "../../../../../src/hb-backend-api/today-menu/domain/ports/out/today-menu-persistence.port";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { TransactionRunner } from "../../../../../src/infra/mongo/transaction/transaction.runner";
import { TodayMenuId } from "../../../../../src/hb-backend-api/today-menu/domain/model/today-menu.vo";
import { TodayMenuRelationEntity } from "../../../../../src/hb-backend-api/today-menu/domain/model/today-menu-with-relations.entity";
import {
  MenuRecommendationRelationEntity,
  RegisterPerson,
} from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-recommendation-with-relations.entity";
import { MenuRecommendationId } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-recommendation-id.vo";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { YearMonthDayString } from "../../../../../src/hb-backend-api/daily-todo/domain/vo/year-month-day-string.vo";
import { UpsertTodayMenuCommand } from "../../../../../src/hb-backend-api/today-menu/domain/ports/out/upsert-today-menu.command";
import { MenuKind } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-kind.enum";
import { MenuTimeOfMeal } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-time-of-meal.enum";
import { FoodType } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/food-type.enum";

// ──────────────────────────────────────────────
// Test Factories
// ──────────────────────────────────────────────
const makeTodayMenuId = () => new TodayMenuId(new Types.ObjectId());
const makeMenuRecommendationId = () =>
  new MenuRecommendationId(new Types.ObjectId());
const makeUserId = () => new UserId(new Types.ObjectId());
const makeDate = () => YearMonthDayString.fromString("2026-02-19");

const makeRegisterPerson = () =>
  RegisterPerson.of(makeUserId(), "chef", "쉐프");

const makeMenuRecommendationRelation = (
  id = makeMenuRecommendationId(),
): MenuRecommendationRelationEntity =>
  MenuRecommendationRelationEntity.of(
    id,
    "비빔밥",
    MenuKind.KOREAN,
    MenuTimeOfMeal.LUNCH,
    FoodType.MEAL,
    makeRegisterPerson(),
  );

const makeTodayMenuRelation = (
  id = makeTodayMenuId(),
  recommendedMenu: MenuRecommendationRelationEntity | null = makeMenuRecommendationRelation(),
): TodayMenuRelationEntity =>
  TodayMenuRelationEntity.of(
    id,
    recommendedMenu,
    [makeMenuRecommendationRelation()],
    makeDate(),
  );

// ──────────────────────────────────────────────
// FindTodayMenuByIdService
// ──────────────────────────────────────────────
describe("FindTodayMenuByIdService", () => {
  let service: FindTodayMenuByIdService;
  let queryPort: jest.Mocked<TodayMenuQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindTodayMenuByIdService,
        {
          provide: DIToken.TodayMenuModule.TodayMenuQueryPort,
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(FindTodayMenuByIdService);
    queryPort = module.get(DIToken.TodayMenuModule.TodayMenuQueryPort);
  });

  it("추천 메뉴가 있으면 GetTodayMenuQueryResult를 반환해야 한다", async () => {
    const id = makeTodayMenuId();
    queryPort.findById.mockResolvedValue(makeTodayMenuRelation(id));

    const result = await service.invoke(id);

    expect(queryPort.findById).toHaveBeenCalledWith(id);
    expect(result).toBeDefined();
    expect(result.getId).toBe(id);
  });

  it("recommendedMenu가 null이면 NotFoundException을 던져야 한다", async () => {
    const id = makeTodayMenuId();
    queryPort.findById.mockResolvedValue(makeTodayMenuRelation(id, null));

    await expect(service.invoke(id)).rejects.toThrow(NotFoundException);
  });
});

// ──────────────────────────────────────────────
// UpsertTodayMenuService
// ──────────────────────────────────────────────
describe("UpsertTodayMenuService", () => {
  let service: UpsertTodayMenuService;
  let persistencePort: jest.Mocked<TodayMenuPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpsertTodayMenuService,
        {
          provide: DIToken.TodayMenuModule.TodayMenuPersistencePort,
          useValue: { upsert: jest.fn() },
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(UpsertTodayMenuService);
    persistencePort = module.get(
      DIToken.TodayMenuModule.TodayMenuPersistencePort,
    );
  });

  it("UpsertTodayMenuCommand로 upsert를 호출하고 TodayMenuId를 반환해야 한다", async () => {
    const expectedId = makeTodayMenuId();
    persistencePort.upsert.mockResolvedValue(expectedId);

    const command = UpsertTodayMenuCommand.of(
      [makeMenuRecommendationId()],
      makeMenuRecommendationId(),
      makeDate(),
      null,
    );

    const result = await service.invoke(command);

    expect(persistencePort.upsert).toHaveBeenCalledTimes(1);
    expect(result).toBe(expectedId);
  });

  it("todayMenuId가 있으면 기존 메뉴를 업데이트해야 한다 (upsert 호출)", async () => {
    const existingId = makeTodayMenuId();
    persistencePort.upsert.mockResolvedValue(existingId);

    const command = UpsertTodayMenuCommand.of(
      [makeMenuRecommendationId()],
      makeMenuRecommendationId(),
      makeDate(),
      existingId,
    );

    await service.invoke(command);

    expect(persistencePort.upsert).toHaveBeenCalledTimes(1);
    const entityPassed = persistencePort.upsert.mock.calls[0][0];
    expect(entityPassed.getTodayMenuId).toBe(existingId);
  });
});
