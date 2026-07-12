import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { CreateMenuRecommendationController } from "../../../../../src/hb-backend-api/menu-recommendation/adapters/in/create-menu-recommendation.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { UserQueryResult } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.result";
import { MenuKind } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-kind.enum";
import { MenuTimeOfMeal } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-time-of-meal.enum";
import { FoodType } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/food-type.enum";
import { TokenUserInformation } from "../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("CreateMenuRecommendationController", () => {
  let controller: CreateMenuRecommendationController;
  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockCreateMenuRecommendationUseCase = { invoke: jest.fn() };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
  const mockUser = new UserQueryResult(
    userId,
    "testuser",
    "test@test.com",
    "Robin",
    [],
  );
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
  } as TokenUserInformation;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateMenuRecommendationController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide:
            DIToken.MenuRecommendationModule.CreateMenuRecommendationUseCase,
          useValue: mockCreateMenuRecommendationUseCase,
        },
      ],
    }).compile();

    controller = module.get(CreateMenuRecommendationController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  describe("create", () => {
    it("should resolve user and call createMenuRecommendationUseCase", async () => {
      mockCreateMenuRecommendationUseCase.invoke.mockResolvedValue(undefined);

      await controller.create(userInfo, {
        name: "bibimbap",
        menuKind: MenuKind.KOREAN,
        timeOfMeal: MenuTimeOfMeal.LUNCH,
        foodType: FoodType.MEAL,
      });

      expect(mockGetUserByNicknameUseCase.invoke).toHaveBeenCalledTimes(1);
      expect(mockCreateMenuRecommendationUseCase.invoke).toHaveBeenCalledTimes(
        1,
      );
    });

    it("should propagate use case error", async () => {
      mockCreateMenuRecommendationUseCase.invoke.mockRejectedValue(
        new Error("duplicate menu"),
      );

      await expect(
        controller.create(userInfo, {
          name: "bibimbap",
          menuKind: MenuKind.KOREAN,
          timeOfMeal: MenuTimeOfMeal.LUNCH,
          foodType: FoodType.MEAL,
        }),
      ).rejects.toThrow("duplicate menu");
    });
  });
});
