import { Types } from "mongoose";
import { MenuRecommendationRepository } from "../../../../../../src/hb-backend-api/menu-recommendation/infra/menu-recommendation.repository";
import { MenuRecommendationPersistenceAdapter } from "../../../../../../src/hb-backend-api/menu-recommendation/adapters/out/persistence/menu-recommendation-persistence.adapter";
import { createMenuRecommendationRepository } from "../../../../../mocks/menu-recommendation.repository.mock";
import { UserId } from "../../../../../../src/hb-backend-api/user/domain/vo/user-id.vo";
import { CreateMenuRecommendationEntity } from "../../../../../../src/hb-backend-api/menu-recommendation/domain/entity/create-menu-recommendation.entity";
import { MenuKind } from "../../../../../../src/hb-backend-api/menu-recommendation/domain/enums/menu-kind.enum";
import { MenuTimeOfMeal } from "../../../../../../src/hb-backend-api/menu-recommendation/domain/enums/menu-time-of-meal.enum";
import { FoodType } from "../../../../../../src/hb-backend-api/menu-recommendation/domain/enums/food-type.enum";

describe("MenuRecommendationAdapter", () => {
  let menuRecommendationRepository: jest.Mocked<MenuRecommendationRepository>;
  let menuRecommendationPersistenceAdapter: MenuRecommendationPersistenceAdapter;

  beforeEach(() => {
    menuRecommendationRepository = createMenuRecommendationRepository();
    menuRecommendationPersistenceAdapter =
      new MenuRecommendationPersistenceAdapter(menuRecommendationRepository);
  });

  describe("save()", () => {
    it("should call menuRecommendationPersistenceAdapter.save with the given menu recommendation entity", async () => {
      const userId = new UserId(new Types.ObjectId());
      const menuRecommendation = CreateMenuRecommendationEntity.of(
        "menu",
        MenuKind.KOREAN,
        MenuTimeOfMeal.BREAKFAST,
        FoodType.MEAL,
        userId,
      );

      await menuRecommendationPersistenceAdapter.save(menuRecommendation);

      expect(menuRecommendationRepository.save).toHaveBeenCalledTimes(1);
      expect(menuRecommendationRepository.save).toHaveBeenCalledWith(
        menuRecommendation,
      );
    });
  });
});
