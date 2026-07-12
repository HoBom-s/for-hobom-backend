import { Test, TestingModule } from "@nestjs/testing";
import { UpsertTodayMenuController } from "../../../../../src/hb-backend-api/today-menu/adapters/in/upsert-today-menu.controller";
import { UpsertTodayMenuUseCase } from "../../../../../src/hb-backend-api/today-menu/domain/ports/in/upsert-today-menu.use-case";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { TodayMenuId } from "../../../../../src/hb-backend-api/today-menu/domain/model/today-menu.vo";
import { Types } from "mongoose";

describe("UpsertTodayMenuController", () => {
  let controller: UpsertTodayMenuController;
  let upsertTodayMenuUseCase: jest.Mocked<UpsertTodayMenuUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpsertTodayMenuController],
      providers: [
        {
          provide: DIToken.TodayMenuModule.UpsertTodayMenuUseCase,
          useValue: { invoke: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(UpsertTodayMenuController);
    upsertTodayMenuUseCase = module.get(
      DIToken.TodayMenuModule.UpsertTodayMenuUseCase,
    );
  });

  it("should call use case with full body and return todayMenuId", async () => {
    const candidateId1 = new Types.ObjectId();
    const candidateId2 = new Types.ObjectId();
    const recommendedMenuId = new Types.ObjectId();
    const todayMenuObjectId = new Types.ObjectId();
    const returnedTodayMenuId = new TodayMenuId(new Types.ObjectId());

    upsertTodayMenuUseCase.invoke.mockResolvedValue(returnedTodayMenuId);

    const body = {
      candidates: [candidateId1.toHexString(), candidateId2.toHexString()],
      recommendedMenu: recommendedMenuId.toHexString(),
      recommendationDate: "2026-03-14",
      todayMenuId: todayMenuObjectId.toHexString(),
    };

    const result = await controller.upsert(body);

    expect(upsertTodayMenuUseCase.invoke).toHaveBeenCalledTimes(1);
    const command = upsertTodayMenuUseCase.invoke.mock.calls[0][0];
    expect(command.getCandidates).toHaveLength(2);
    expect(command.getCandidates[0].toString()).toBe(
      candidateId1.toHexString(),
    );
    expect(command.getCandidates[1].toString()).toBe(
      candidateId2.toHexString(),
    );
    expect(command.getRecommendedMenu?.toString()).toBe(
      recommendedMenuId.toHexString(),
    );
    expect(command.getRecommendationDate?.value).toBe("2026-03-14");
    expect(command.getTodayMenuId?.toString()).toBe(
      todayMenuObjectId.toHexString(),
    );
    expect(result.todayMenuId).toBe(returnedTodayMenuId.toString());
  });

  it("should handle null optional fields", async () => {
    const candidateId = new Types.ObjectId();
    const returnedTodayMenuId = new TodayMenuId(new Types.ObjectId());

    upsertTodayMenuUseCase.invoke.mockResolvedValue(returnedTodayMenuId);

    const body = {
      candidates: [candidateId.toHexString()],
      recommendedMenu: null,
      recommendationDate: null,
      todayMenuId: null,
    };

    const result = await controller.upsert(body);

    expect(upsertTodayMenuUseCase.invoke).toHaveBeenCalledTimes(1);
    const command = upsertTodayMenuUseCase.invoke.mock.calls[0][0];
    expect(command.getRecommendedMenu).toBeNull();
    expect(command.getRecommendationDate).toBeNull();
    expect(command.getTodayMenuId).toBeNull();
    expect(result.todayMenuId).toBe(returnedTodayMenuId.toString());
  });
});
