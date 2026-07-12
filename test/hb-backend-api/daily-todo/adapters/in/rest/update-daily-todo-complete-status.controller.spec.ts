import { Test, TestingModule } from "@nestjs/testing";
import { UpdateDailyTodoCompleteStatusController } from "../../../../../../src/hb-backend-api/daily-todo/adapters/in/rest/update-daily-todo-complete-status.controller";
import { DIToken } from "../../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { DailyTodoId } from "../../../../../../src/hb-backend-api/daily-todo/domain/vo/daily-todo-id.vo";
import { DailyTodoCompleteStatus } from "../../../../../../src/hb-backend-api/daily-todo/domain/enums/daily-todo-complete-status.enum";
import { Types } from "mongoose";
import { TokenUserInformation } from "../../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("UpdateDailyTodoCompleteStatusController", () => {
  let controller: UpdateDailyTodoCompleteStatusController;

  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockUpdateCompleteStatusUseCase = { invoke: jest.fn() };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
  const mockUser = { getId: userId };
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
    accessToken: "token-123",
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateDailyTodoCompleteStatusController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.DailyTodoModule.UpdateDailyTodoCompleteStatusUseCase,
          useValue: mockUpdateCompleteStatusUseCase,
        },
      ],
    }).compile();

    controller = module.get(UpdateDailyTodoCompleteStatusController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  it("should call use case with id, userId, and command", async () => {
    const todoId = DailyTodoId.fromString(new Types.ObjectId().toHexString());
    mockUpdateCompleteStatusUseCase.invoke.mockResolvedValue(undefined);

    await controller.changeCompleteStatus(userInfo, todoId, {
      status: DailyTodoCompleteStatus.COMPLETED,
    });

    expect(mockUpdateCompleteStatusUseCase.invoke).toHaveBeenCalledTimes(1);
    const [id, uid, command] =
      mockUpdateCompleteStatusUseCase.invoke.mock.calls[0];
    expect(id).toBe(todoId);
    expect(uid).toBe(userId);
    expect(command.getStatus).toBe(DailyTodoCompleteStatus.COMPLETED);
  });

  it("should propagate use case error", async () => {
    const todoId = DailyTodoId.fromString(new Types.ObjectId().toHexString());
    mockUpdateCompleteStatusUseCase.invoke.mockRejectedValue(new Error("fail"));

    await expect(
      controller.changeCompleteStatus(userInfo, todoId, {
        status: DailyTodoCompleteStatus.PROGRESS,
      }),
    ).rejects.toThrow("fail");
  });
});
