import { Test, TestingModule } from "@nestjs/testing";
import { DeleteDailyTodoController } from "../../../../../../src/hb-backend-api/daily-todo/adapters/in/rest/delete-daily-todo.controller";
import { DIToken } from "../../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { DailyTodoId } from "../../../../../../src/hb-backend-api/daily-todo/domain/vo/daily-todo-id.vo";
import { Types } from "mongoose";
import { TokenUserInformation } from "../../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("DeleteDailyTodoController", () => {
  let controller: DeleteDailyTodoController;

  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockDeleteDailyTodoUseCase = { invoke: jest.fn() };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
  const mockUser = { getId: userId };
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
    accessToken: "token-123",
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeleteDailyTodoController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.DailyTodoModule.DeleteDailyTodoUseCase,
          useValue: mockDeleteDailyTodoUseCase,
        },
      ],
    }).compile();

    controller = module.get(DeleteDailyTodoController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  it("should call deleteDailyTodoUseCase with id and userId", async () => {
    const todoId = DailyTodoId.fromString(new Types.ObjectId().toHexString());
    mockDeleteDailyTodoUseCase.invoke.mockResolvedValue(undefined);

    await controller.deleteDailyTodo(userInfo, todoId);

    expect(mockDeleteDailyTodoUseCase.invoke).toHaveBeenCalledWith(
      todoId,
      userId,
    );
  });

  it("should propagate use case error", async () => {
    const todoId = DailyTodoId.fromString(new Types.ObjectId().toHexString());
    mockDeleteDailyTodoUseCase.invoke.mockRejectedValue(new Error("not found"));

    await expect(controller.deleteDailyTodo(userInfo, todoId)).rejects.toThrow(
      "not found",
    );
  });
});
