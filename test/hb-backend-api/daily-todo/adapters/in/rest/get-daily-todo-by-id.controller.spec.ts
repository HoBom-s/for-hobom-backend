import { Test, TestingModule } from "@nestjs/testing";
import { GetDailyTodoByIdController } from "../../../../../../src/hb-backend-api/daily-todo/adapters/in/rest/get-daily-todo-by-id.controller";
import { DIToken } from "../../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { DailyTodoId } from "../../../../../../src/hb-backend-api/daily-todo/domain/vo/daily-todo-id.vo";
import { DailyTodoCompleteStatus } from "../../../../../../src/hb-backend-api/daily-todo/domain/enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "../../../../../../src/hb-backend-api/daily-todo/domain/enums/daily-todo-cycle.enum";
import {
  Owner,
  Category,
} from "../../../../../../src/hb-backend-api/daily-todo/domain/entity/daily-todo.retations";
import { DailyTodoWithRelationQueryResult } from "../../../../../../src/hb-backend-api/daily-todo/application/result/daily-todo-query.result";
import { CategoryId } from "../../../../../../src/hb-backend-api/category/domain/model/category-id.vo";
import { Types } from "mongoose";
import { TokenUserInformation } from "../../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("GetDailyTodoByIdController", () => {
  let controller: GetDailyTodoByIdController;

  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockGetDailyTodoUseCase = { invoke: jest.fn() };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
  const mockUser = { getId: userId };
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
    accessToken: "token-123",
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetDailyTodoByIdController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.DailyTodoModule.GetDailyTodoUseCase,
          useValue: mockGetDailyTodoUseCase,
        },
      ],
    }).compile();

    controller = module.get(GetDailyTodoByIdController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  it("should return mapped GetDailyTodoDto", async () => {
    const todoId = DailyTodoId.fromString(new Types.ObjectId().toHexString());
    const owner = Owner.of(userId, "robin_user", "Robin");
    const category = Category.of(
      CategoryId.fromString(new Types.ObjectId().toHexString()),
      "Work",
    );
    const queryResult = new DailyTodoWithRelationQueryResult(
      todoId,
      "Single Todo",
      new Date("2026-03-14"),
      null,
      DailyTodoCompleteStatus.PROGRESS,
      DailyTodoCycle.EVERYDAY,
      owner,
      category,
    );
    mockGetDailyTodoUseCase.invoke.mockResolvedValue(queryResult);

    const result = await controller.findById(todoId, userInfo);

    expect(mockGetDailyTodoUseCase.invoke).toHaveBeenCalledWith(todoId, userId);
    expect(result.title).toBe("Single Todo");
    expect(result.id).toBe(todoId.toString());
  });

  it("should propagate use case error", async () => {
    const todoId = DailyTodoId.fromString(new Types.ObjectId().toHexString());
    mockGetDailyTodoUseCase.invoke.mockRejectedValue(new Error("not found"));

    await expect(controller.findById(todoId, userInfo)).rejects.toThrow(
      "not found",
    );
  });
});
