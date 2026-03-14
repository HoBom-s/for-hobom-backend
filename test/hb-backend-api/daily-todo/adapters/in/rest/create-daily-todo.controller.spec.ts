import { Test, TestingModule } from "@nestjs/testing";
import { CreateDailyTodoController } from "../../../../../../src/hb-backend-api/daily-todo/adapters/in/rest/create-daily-todo.controller";
import { DIToken } from "../../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { DailyTodoCycle } from "../../../../../../src/hb-backend-api/daily-todo/domain/enums/daily-todo-cycle.enum";
import { Types } from "mongoose";
import { TokenUserInformation } from "../../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("CreateDailyTodoController", () => {
  let controller: CreateDailyTodoController;

  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockCreateDailyTodoUseCase = { invoke: jest.fn() };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
  const mockUser = { getId: userId };
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
    accessToken: "token-123",
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateDailyTodoController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.DailyTodoModule.CreateDailyTodoUseCase,
          useValue: mockCreateDailyTodoUseCase,
        },
      ],
    }).compile();

    controller = module.get(CreateDailyTodoController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  it("should resolve user and call createDailyTodoUseCase", async () => {
    const categoryId = new Types.ObjectId().toHexString();
    mockCreateDailyTodoUseCase.invoke.mockResolvedValue(undefined);

    await controller.create(userInfo, {
      title: "Test Todo",
      date: "2026-03-14",
      category: categoryId,
      cycle: DailyTodoCycle.EVERYDAY,
    });

    expect(mockGetUserByNicknameUseCase.invoke).toHaveBeenCalledTimes(1);
    expect(mockCreateDailyTodoUseCase.invoke).toHaveBeenCalledTimes(1);
    const [command, ownerId] = mockCreateDailyTodoUseCase.invoke.mock.calls[0];
    expect(command.getTitle).toBe("Test Todo");
    expect(command.getCategory.toString()).toBe(categoryId);
    expect(command.getCycle).toBe(DailyTodoCycle.EVERYDAY);
    expect(ownerId).toBe(userId);
  });

  it("should propagate use case error", async () => {
    mockCreateDailyTodoUseCase.invoke.mockRejectedValue(new Error("fail"));

    await expect(
      controller.create(userInfo, {
        title: "T",
        date: "2026-03-14",
        category: new Types.ObjectId().toHexString(),
      }),
    ).rejects.toThrow("fail");
  });
});
