import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { FindAllMenuRecommendationController } from "../../../../../src/hb-backend-api/menu-recommendation/adapters/in/find-all-menu-recommendation.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { GetMenuRecommendationQueryResult } from "../../../../../src/hb-backend-api/menu-recommendation/domain/ports/out/get-menu-recommendation-query.result";
import { MenuRecommendationId } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-recommendation-id.vo";
import { MenuKind } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-kind.enum";
import { MenuTimeOfMeal } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-time-of-meal.enum";
import { FoodType } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/food-type.enum";
import { RegisterPerson } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-recommendation-with-relations.entity";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";

describe("FindAllMenuRecommendationController", () => {
  let controller: FindAllMenuRecommendationController;
  const mockFindAllMenuRecommendationUseCase = { invoke: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FindAllMenuRecommendationController],
      providers: [
        {
          provide:
            DIToken.MenuRecommendationModule.FindAllMenuRecommendationUseCase,
          useValue: mockFindAllMenuRecommendationUseCase,
        },
      ],
    }).compile();

    controller = module.get(FindAllMenuRecommendationController);
  });

  describe("findAll", () => {
    it("should return mapped GetMenuRecommendationDto array", async () => {
      const menuId = MenuRecommendationId.fromString(
        new Types.ObjectId().toHexString(),
      );
      const personId = UserId.fromString(new Types.ObjectId().toHexString());
      const person = RegisterPerson.of(personId, "testuser", "Robin");
      const queryResult = new GetMenuRecommendationQueryResult(
        menuId,
        "bibimbap",
        MenuKind.KOREAN,
        MenuTimeOfMeal.LUNCH,
        FoodType.MEAL,
        person,
      );
      mockFindAllMenuRecommendationUseCase.invoke.mockResolvedValue([
        queryResult,
      ]);

      const result = await controller.findAll();

      expect(mockFindAllMenuRecommendationUseCase.invoke).toHaveBeenCalledTimes(
        1,
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(menuId.toString());
      expect(result[0].name).toBe("bibimbap");
      expect(result[0].menuKind).toBe(MenuKind.KOREAN);
      expect(result[0].timeOfMeal).toBe(MenuTimeOfMeal.LUNCH);
      expect(result[0].foodType).toBe(FoodType.MEAL);
      expect(result[0].registerPerson.id).toBe(personId.toString());
      expect(result[0].registerPerson.username).toBe("testuser");
      expect(result[0].registerPerson.nickname).toBe("Robin");
    });

    it("should return empty array when no menus", async () => {
      mockFindAllMenuRecommendationUseCase.invoke.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });

    it("should propagate use case error", async () => {
      mockFindAllMenuRecommendationUseCase.invoke.mockRejectedValue(
        new Error("db error"),
      );

      await expect(controller.findAll()).rejects.toThrow("db error");
    });
  });
});
