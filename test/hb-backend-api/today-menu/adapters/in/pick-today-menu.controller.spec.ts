import { Test, TestingModule } from "@nestjs/testing";
import { PickTodayMenuController } from "../../../../../src/hb-backend-api/today-menu/adapters/in/pick-today-menu.controller";
import { PickTodayMenuUseCase } from "../../../../../src/hb-backend-api/today-menu/domain/ports/in/pick-today-menu.use-case";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { MenuRecommendationId } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-recommendation-id.vo";
import { Types } from "mongoose";

describe("PickTodayMenuController", () => {
  let controller: PickTodayMenuController;
  let pickTodayMenuUseCase: jest.Mocked<PickTodayMenuUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PickTodayMenuController],
      providers: [
        {
          provide: DIToken.TodayMenuModule.PickTodayMenuUseCase,
          useValue: { invoke: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(PickTodayMenuController);
    pickTodayMenuUseCase = module.get(
      DIToken.TodayMenuModule.PickTodayMenuUseCase,
    );
  });

  it("should call use case with correct todayMenuId and return picked menu id", async () => {
    const todayMenuObjectId = new Types.ObjectId();
    const pickedMenuId = new MenuRecommendationId(new Types.ObjectId());
    pickTodayMenuUseCase.invoke.mockResolvedValue(pickedMenuId);

    const result = await controller.pickMenu({
      todayMenuId: todayMenuObjectId.toHexString(),
    });

    expect(pickTodayMenuUseCase.invoke).toHaveBeenCalledTimes(1);
    const command = pickTodayMenuUseCase.invoke.mock.calls[0][0];
    expect(command.getId.toString()).toBe(todayMenuObjectId.toHexString());

    expect(result.recommendedMenuId).toBe(pickedMenuId.toString());
  });
});
