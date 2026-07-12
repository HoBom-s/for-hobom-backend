import { Test, TestingModule } from "@nestjs/testing";
import { UpdateDailyTodoController } from "../../../../../../src/hb-backend-api/daily-todo/adapters/in/rest/update-daily-todo.controller";
import { DIToken } from "../../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { DailyTodoId } from "../../../../../../src/hb-backend-api/daily-todo/domain/vo/daily-todo-id.vo";
import { Types } from "mongoose";
import { TokenUserInformation } from "../../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("UpdateDailyTodoController", () => {
  let controller: UpdateDailyTodoController;

  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockUpdateDailyTodoUseCase = { invoke: jest.fn() };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
  const mockUser = { getId: userId };
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
    accessToken: "token-123",
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateDailyTodoController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.DailyTodoModule.UpdateDailyTodoUseCase,
          useValue: mockUpdateDailyTodoUseCase,
        },
      ],
    }).compile();

    controller = module.get(UpdateDailyTodoController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  it("should call use case with id, userId, and command including all fields", async () => {
    const todoId = DailyTodoId.fromString(new Types.ObjectId().toHexString());
    const categoryId = new Types.ObjectId().toHexString();
    mockUpdateDailyTodoUseCase.invoke.mockResolvedValue(undefined);

    await controller.update(userInfo, todoId, {
      title: "Updated",
      date: "2026-04-01",
      category: categoryId,
    });

    expect(mockUpdateDailyTodoUseCase.invoke).toHaveBeenCalledTimes(1);
    const [id, uid, command] = mockUpdateDailyTodoUseCase.invoke.mock.calls[0];
    expect(id).toBe(todoId);
    expect(uid).toBe(userId);
    expect(command.getTitle).toBe("Updated");
    expect(command.getDate).toBeInstanceOf(Date);
    expect(command.getCategory.toString()).toBe(categoryId);
  });

  it("should pass undefined for omitted optional fields", async () => {
    const todoId = DailyTodoId.fromString(new Types.ObjectId().toHexString());
    mockUpdateDailyTodoUseCase.invoke.mockResolvedValue(undefined);

    await controller.update(userInfo, todoId, { title: "Only title" });

    const command = mockUpdateDailyTodoUseCase.invoke.mock.calls[0][2];
    expect(command.getTitle).toBe("Only title");
    expect(command.getDate).toBeUndefined();
    expect(command.getCategory).toBeUndefined();
  });

  it("should propagate use case error", async () => {
    const todoId = DailyTodoId.fromString(new Types.ObjectId().toHexString());
    mockUpdateDailyTodoUseCase.invoke.mockRejectedValue(new Error("fail"));

    await expect(
      controller.update(userInfo, todoId, { title: "T" }),
    ).rejects.toThrow("fail");
  });
});
