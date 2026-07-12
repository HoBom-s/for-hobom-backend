import { Test, TestingModule } from "@nestjs/testing";
import { GetAllDailyTodoController } from "../../../../../../src/hb-backend-api/daily-todo/adapters/in/rest/get-all-daily-todo.controller";
import { DIToken } from "../../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { DailyTodoId } from "../../../../../../src/hb-backend-api/daily-todo/domain/vo/daily-todo-id.vo";
import { DailyTodoCompleteStatus } from "../../../../../../src/hb-backend-api/daily-todo/domain/enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "../../../../../../src/hb-backend-api/daily-todo/domain/enums/daily-todo-cycle.enum";
import { YearMonthDayString } from "../../../../../../src/hb-backend-api/daily-todo/domain/vo/year-month-day-string.vo";
import {
  Owner,
  Category,
} from "../../../../../../src/hb-backend-api/daily-todo/domain/entity/daily-todo.retations";
import { DailyTodoWithRelationQueryResult } from "../../../../../../src/hb-backend-api/daily-todo/application/result/daily-todo-query.result";
import { CategoryId } from "../../../../../../src/hb-backend-api/category/domain/model/category-id.vo";
import { Types } from "mongoose";
import { TokenUserInformation } from "../../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("GetAllDailyTodoController", () => {
  let controller: GetAllDailyTodoController;

  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockGetAllDailyTodoUseCase = { invoke: jest.fn() };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
  const mockUser = { getId: userId };
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
    accessToken: "token-123",
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetAllDailyTodoController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.DailyTodoModule.GetAllDailyTodoUseCase,
          useValue: mockGetAllDailyTodoUseCase,
        },
      ],
    }).compile();

    controller = module.get(GetAllDailyTodoController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  it("should return mapped GetDailyTodoDto array", async () => {
    const date = new YearMonthDayString("2026-03-14");
    const todoId = DailyTodoId.fromString(new Types.ObjectId().toHexString());
    const owner = Owner.of(userId, "robin_user", "Robin");
    const category = Category.of(
      CategoryId.fromString(new Types.ObjectId().toHexString()),
      "Work",
    );
    const queryResult = new DailyTodoWithRelationQueryResult(
      todoId,
      "Test Todo",
      new Date("2026-03-14"),
      null,
      DailyTodoCompleteStatus.PROGRESS,
      DailyTodoCycle.EVERYDAY,
      owner,
      category,
    );
    mockGetAllDailyTodoUseCase.invoke.mockResolvedValue([queryResult]);

    const result = await controller.findAll(date, userInfo);

    expect(mockGetAllDailyTodoUseCase.invoke).toHaveBeenCalledWith(
      userId,
      date,
    );
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Test Todo");
    expect(result[0].progress).toBe(DailyTodoCompleteStatus.PROGRESS);
  });

  it("should propagate use case error", async () => {
    const date = new YearMonthDayString("2026-03-14");
    mockGetAllDailyTodoUseCase.invoke.mockRejectedValue(new Error("fail"));

    await expect(controller.findAll(date, userInfo)).rejects.toThrow("fail");
  });
});
