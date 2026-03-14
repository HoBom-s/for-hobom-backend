import { Test, TestingModule } from "@nestjs/testing";
import { GetAllDailyTodoByDateController } from "../../../../../../src/hb-backend-api/daily-todo/adapters/in/rest/get-all-daily-todo-by-date.controller";
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

describe("GetAllDailyTodoByDateController", () => {
  let controller: GetAllDailyTodoByDateController;

  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockGetDailyTodoByDateUseCase = { invoke: jest.fn() };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
  const mockUser = { getId: userId };
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
    accessToken: "token-123",
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetAllDailyTodoByDateController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.DailyTodoModule.GetDailyTodoByDateUseCase,
          useValue: mockGetDailyTodoByDateUseCase,
        },
      ],
    }).compile();

    controller = module.get(GetAllDailyTodoByDateController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  it("should return mapped GetDailyTodoDto array by date", async () => {
    const date = new YearMonthDayString("2026-03-14");
    const todoId = DailyTodoId.fromString(new Types.ObjectId().toHexString());
    const owner = Owner.of(userId, "robin_user", "Robin");
    const category = Category.of(
      CategoryId.fromString(new Types.ObjectId().toHexString()),
      "Study",
    );
    const queryResult = new DailyTodoWithRelationQueryResult(
      todoId,
      "Date Todo",
      new Date("2026-03-14"),
      null,
      DailyTodoCompleteStatus.COMPLETED,
      DailyTodoCycle.EVERY_WEEKDAY,
      owner,
      category,
    );
    mockGetDailyTodoByDateUseCase.invoke.mockResolvedValue([queryResult]);

    const result = await controller.findByDate(date, userInfo);

    expect(mockGetDailyTodoByDateUseCase.invoke).toHaveBeenCalledWith(
      userId,
      date,
    );
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Date Todo");
    expect(result[0].progress).toBe(DailyTodoCompleteStatus.COMPLETED);
  });

  it("should propagate use case error", async () => {
    const date = new YearMonthDayString("2026-03-14");
    mockGetDailyTodoByDateUseCase.invoke.mockRejectedValue(new Error("fail"));

    await expect(controller.findByDate(date, userInfo)).rejects.toThrow("fail");
  });
});
