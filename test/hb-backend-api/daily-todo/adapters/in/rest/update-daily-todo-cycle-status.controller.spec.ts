import { Test, TestingModule } from "@nestjs/testing";
import { UpdateDailyTodoCycleStatusController } from "../../../../../../src/hb-backend-api/daily-todo/adapters/in/rest/update-daily-todo-cycle-status.controller";
import { DIToken } from "../../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { DailyTodoId } from "../../../../../../src/hb-backend-api/daily-todo/domain/vo/daily-todo-id.vo";
import { DailyTodoCycle } from "../../../../../../src/hb-backend-api/daily-todo/domain/enums/daily-todo-cycle.enum";
import { Types } from "mongoose";
import { TokenUserInformation } from "../../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("UpdateDailyTodoCycleStatusController", () => {
  let controller: UpdateDailyTodoCycleStatusController;

  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockUpdateCycleUseCase = { invoke: jest.fn() };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
  const mockUser = { getId: userId };
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
    accessToken: "token-123",
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateDailyTodoCycleStatusController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.DailyTodoModule.UpdateDailyTodoCycleUseCase,
          useValue: mockUpdateCycleUseCase,
        },
      ],
    }).compile();

    controller = module.get(UpdateDailyTodoCycleStatusController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  it("should call use case with id, userId, and cycle command", async () => {
    const todoId = DailyTodoId.fromString(new Types.ObjectId().toHexString());
    mockUpdateCycleUseCase.invoke.mockResolvedValue(undefined);

    await controller.changeCycleStatus(userInfo, todoId, {
      cycle: DailyTodoCycle.EVERY_WEEKEND,
    });

    expect(mockUpdateCycleUseCase.invoke).toHaveBeenCalledTimes(1);
    const [id, uid, command] = mockUpdateCycleUseCase.invoke.mock.calls[0];
    expect(id).toBe(todoId);
    expect(uid).toBe(userId);
    expect(command.getCycle).toBe(DailyTodoCycle.EVERY_WEEKEND);
  });

  it("should propagate use case error", async () => {
    const todoId = DailyTodoId.fromString(new Types.ObjectId().toHexString());
    mockUpdateCycleUseCase.invoke.mockRejectedValue(new Error("fail"));

    await expect(
      controller.changeCycleStatus(userInfo, todoId, {
        cycle: DailyTodoCycle.EVERYDAY,
      }),
    ).rejects.toThrow("fail");
  });
});
