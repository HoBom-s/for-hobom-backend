import { Types } from "mongoose";
import { GetTodayMenuDto } from "src/hb-backend-api/today-menu/adapters/in/get-today-menu.dto";
import {
  GetTodayMenuQueryResult,
  MenuItem,
  RegisterPerson,
} from "src/hb-backend-api/today-menu/domain/ports/out/get-today-menu-query.result";
import { TodayMenuId } from "src/hb-backend-api/today-menu/domain/model/today-menu.vo";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { MenuRecommendationId } from "src/hb-backend-api/menu-recommendation/domain/model/menu-recommendation-id.vo";
import { MenuTimeOfMeal } from "src/hb-backend-api/menu-recommendation/domain/model/menu-time-of-meal.enum";
import { FoodType } from "src/hb-backend-api/menu-recommendation/domain/model/food-type.enum";
import { MenuKind } from "src/hb-backend-api/menu-recommendation/domain/model/menu-kind.enum";
import { YearMonthDayString } from "src/hb-backend-api/daily-todo/domain/vo/year-month-day-string.vo";

const makeUserId = () => new UserId(new Types.ObjectId());
const makeMenuId = () => new MenuRecommendationId(new Types.ObjectId());
const makeTodayMenuId = () => new TodayMenuId(new Types.ObjectId());

const makePerson = () => RegisterPerson.of(makeUserId(), "testuser", "테스터");

const makeMenuItem = (
  overrides: Partial<{
    timeOfMeal: MenuTimeOfMeal;
    foodType: FoodType;
  }> = {},
) =>
  MenuItem.of(
    makeMenuId(),
    "김치찌개",
    MenuKind.KOREAN,
    overrides.timeOfMeal ?? MenuTimeOfMeal.LUNCH,
    overrides.foodType ?? FoodType.MEAL,
    makePerson(),
  );

describe("GetTodayMenuDto", () => {
  describe("from()", () => {
    it("should map GetTodayMenuQueryResult to DTO", () => {
      const todayMenuId = makeTodayMenuId();
      const recommendedMenu = makeMenuItem();
      const candidates = [
        makeMenuItem({ timeOfMeal: MenuTimeOfMeal.DINNER }),
        makeMenuItem({ foodType: FoodType.DESERT }),
      ];
      const date = YearMonthDayString.fromString("2026-03-14");

      const queryResult = GetTodayMenuQueryResult.of(
        todayMenuId,
        recommendedMenu,
        candidates,
        date,
      );

      const dto = GetTodayMenuDto.from(queryResult);

      expect(dto.id).toBe(todayMenuId.toString());
      expect(dto.recommendationDate).toBe("2026-03-14");
      expect(dto.recommendedMenu.name).toBe("김치찌개");
      expect(dto.recommendedMenu.timeOfMeal).toBe(MenuTimeOfMeal.LUNCH);
      expect(dto.recommendedMenu.foodType).toBe(FoodType.MEAL);
      expect(dto.recommendedMenu.registerPerson.username).toBe("testuser");
      expect(dto.recommendedMenu.registerPerson.nickname).toBe("테스터");
      expect(dto.candidates).toHaveLength(2);
    });

    it("should map candidates correctly", () => {
      const queryResult = GetTodayMenuQueryResult.of(
        makeTodayMenuId(),
        makeMenuItem(),
        [makeMenuItem({ timeOfMeal: MenuTimeOfMeal.BREAKFAST })],
        YearMonthDayString.fromString("2026-01-01"),
      );

      const dto = GetTodayMenuDto.from(queryResult);

      expect(dto.candidates).toHaveLength(1);
      expect(dto.candidates[0].timeOfMeal).toBe(MenuTimeOfMeal.BREAKFAST);
    });

    it("should handle empty candidates", () => {
      const queryResult = GetTodayMenuQueryResult.of(
        makeTodayMenuId(),
        makeMenuItem(),
        [],
        YearMonthDayString.fromString("2026-06-15"),
      );

      const dto = GetTodayMenuDto.from(queryResult);

      expect(dto.candidates).toEqual([]);
    });
  });
});
