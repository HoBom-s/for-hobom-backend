import { Types } from "mongoose";
import { TodayMenuQueryAdapter } from "../../../../../../src/hb-backend-api/today-menu/adapters/out/query/today-menu-query.adapter";
import { TodayMenuRepository } from "../../../../../../src/hb-backend-api/today-menu/infra/today-menu.repository";
import { createTodayMenuRepository } from "../../../../../mocks/today-menu.repository.mock";
import { TodayMenuId } from "../../../../../../src/hb-backend-api/today-menu/domain/vo/today-menu.vo";
import {
  MenuItem as MenuItemType,
  TodayMenuWithRelationsEntity,
} from "../../../../../../src/hb-backend-api/today-menu/domain/entity/today-menu-with-relations.entity";
import { MenuRecommendationId } from "../../../../../../src/hb-backend-api/menu-recommendation/domain/vo/menu-recommendation-id.vo";
import { MenuTimeOfMeal } from "../../../../../../src/hb-backend-api/menu-recommendation/domain/enums/menu-time-of-meal.enum";
import { FoodType } from "../../../../../../src/hb-backend-api/menu-recommendation/domain/enums/food-type.enum";
import { UserId } from "../../../../../../src/hb-backend-api/user/domain/vo/user-id.vo";
import { MenuKind } from "../../../../../../src/hb-backend-api/menu-recommendation/domain/enums/menu-kind.enum";

describe("TodayMenuQueryAdapter", () => {
  let todayMenuRepository: jest.Mocked<TodayMenuRepository>;
  let todayMenuQueryAdapter: TodayMenuQueryAdapter;

  beforeEach(() => {
    todayMenuRepository = createTodayMenuRepository();
    todayMenuQueryAdapter = new TodayMenuQueryAdapter(todayMenuRepository);
  });

  it("should return TodayMenuRelationEntity from todayMenuId", async () => {
    const todayMenuId = new TodayMenuId(new Types.ObjectId());
    const menuRecommendationId = new MenuRecommendationId(new Types.ObjectId());
    const userId = new UserId(new Types.ObjectId());

    const menuItem: MenuItemType = {
      id: menuRecommendationId.toString(),
      name: "FoodName",
      menuKind: MenuKind.AMERICAN,
      timeOfMeal: MenuTimeOfMeal.DINNER,
      foodType: FoodType.BOTH,
      registerPerson: {
        id: userId.toString(),
        username: "Robin Yeon",
        nickname: "Robin",
      },
    };
    const todayMenuWithRelations: TodayMenuWithRelationsEntity = {
      id: todayMenuId.toString(),
      recommendedMenu: menuItem,
      candidates: [menuItem],
      recommendationDate: "2025-06-07",
    };

    todayMenuRepository.findById.mockResolvedValue(todayMenuWithRelations);

    const result = await todayMenuQueryAdapter.findById(todayMenuId);

    expect(result.getId.toString()).toBe(todayMenuId.toString());
    expect(result.getRecommendedMenu?.getId.toString()).toBe(
      menuRecommendationId.toString(),
    );
    expect(result.getRecommendedMenu?.getName).toBe("FoodName");
    expect(result.getCandidates.length).toBe(1);
    expect(result.getRecommendationDate.value).toBe("2025-06-07");
  });
});
