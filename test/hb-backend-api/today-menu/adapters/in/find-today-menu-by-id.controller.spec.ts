import { Test, TestingModule } from "@nestjs/testing";
import { FindTodayMenuByIdController } from "../../../../../src/hb-backend-api/today-menu/adapters/in/find-today-menu-by-id.controller";
import { FindTodayMenuByIdUseCase } from "../../../../../src/hb-backend-api/today-menu/domain/ports/in/find-today-menu-by-id.use-case";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { TodayMenuId } from "../../../../../src/hb-backend-api/today-menu/domain/model/today-menu.vo";
import { Types } from "mongoose";
import {
  GetTodayMenuQueryResult,
  MenuItem,
  RegisterPerson,
} from "../../../../../src/hb-backend-api/today-menu/domain/ports/out/get-today-menu-query.result";
import { MenuRecommendationId } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-recommendation-id.vo";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { YearMonthDayString } from "../../../../../src/hb-backend-api/daily-todo/domain/vo/year-month-day-string.vo";
import { MenuTimeOfMeal } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-time-of-meal.enum";
import { FoodType } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/food-type.enum";
import { MenuKind } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-kind.enum";

describe("FindTodayMenuByIdController", () => {
  let controller: FindTodayMenuByIdController;
  let findTodayMenuByIdUseCase: jest.Mocked<FindTodayMenuByIdUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FindTodayMenuByIdController],
      providers: [
        {
          provide: DIToken.TodayMenuModule.FindTodayMenuByIdUseCase,
          useValue: { invoke: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(FindTodayMenuByIdController);
    findTodayMenuByIdUseCase = module.get(
      DIToken.TodayMenuModule.FindTodayMenuByIdUseCase,
    );
  });

  it("should return mapped GetTodayMenuDto for given id", async () => {
    const todayMenuId = new TodayMenuId(new Types.ObjectId());
    const menuId = new MenuRecommendationId(new Types.ObjectId());
    const userId = new UserId(new Types.ObjectId());
    const person = RegisterPerson.of(userId, "testuser", "testnick");
    const menuItem = MenuItem.of(
      menuId,
      "Bibimbap",
      MenuKind.KOREAN,
      MenuTimeOfMeal.LUNCH,
      FoodType.MEAL,
      person,
    );
    const queryResult = GetTodayMenuQueryResult.of(
      todayMenuId,
      menuItem,
      [menuItem],
      YearMonthDayString.fromString("2026-03-14"),
    );
    findTodayMenuByIdUseCase.invoke.mockResolvedValue(queryResult);

    const result = await controller.findById(todayMenuId);

    expect(findTodayMenuByIdUseCase.invoke).toHaveBeenCalledTimes(1);
    expect(findTodayMenuByIdUseCase.invoke).toHaveBeenCalledWith(todayMenuId);
    expect(result.id).toBe(todayMenuId.toString());
    expect(result.recommendationDate).toBe("2026-03-14");
    expect(result.recommendedMenu.name).toBe("Bibimbap");
    expect(result.candidates).toHaveLength(1);
  });
});
