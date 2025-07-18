import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { DailyTodoQueryAdapter } from "../../../../../src/hb-backend-api/daily-todo/adapters/out/query/daily-todo-query.adapter";
import { DailyTodoRepository } from "../../../../../src/hb-backend-api/daily-todo/domain/repositories/daily-todo.repository";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { YearMonthDayString } from "../../../../../src/hb-backend-api/daily-todo/domain/vo/year-month-day-string.vo";
import { createDailyTodoRepository } from "../../../../mocks/daily-todo.repository.mock";
import { DailyTodoId } from "../../../../../src/hb-backend-api/daily-todo/domain/vo/daily-todo-id.vo";
import { DailyTodoCompleteStatus } from "../../../../../src/hb-backend-api/daily-todo/domain/enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "../../../../../src/hb-backend-api/daily-todo/domain/enums/daily-todo-cycle.enum";
import { CategoryId } from "../../../../../src/hb-backend-api/category/domain/model/category-id.vo";

describe("DailyTodoQueryAdapter", () => {
  let dailyTodoQueryAdapter: DailyTodoQueryAdapter;
  let dailyTodoRepository: jest.Mocked<DailyTodoRepository>;

  beforeEach(async () => {
    dailyTodoRepository = createDailyTodoRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyTodoQueryAdapter,
        {
          provide: DIToken.DailyTodoModule.DailyTodoRepository,
          useValue: dailyTodoRepository,
        },
      ],
    }).compile();

    dailyTodoQueryAdapter = module.get(DailyTodoQueryAdapter);
  });

  const dummyUserId = new UserId(new Types.ObjectId());
  const dummyDate = YearMonthDayString.fromString("2025-05-25");

  describe("findAll()", () => {
    it("should return mapped DailyTodoWithRelationEntity[]", async () => {
      dailyTodoRepository.findAll.mockResolvedValue([
        {
          _id: new DailyTodoId(new Types.ObjectId()).toString(),
          title: "Sample",
          date: new Date(dummyDate.value),
          reaction: null,
          progress: DailyTodoCompleteStatus.PROGRESS,
          cycle: DailyTodoCycle.EVERYDAY,
          owner: {
            id: dummyUserId.toString(),
            username: "Robin",
            nickname: "Robin",
          },
          category: {
            id: new CategoryId(new Types.ObjectId()).toString(),
            title: "Work",
          },
        },
      ]);

      const result = await dailyTodoQueryAdapter.findAll(
        dummyUserId,
        dummyDate,
      );

      expect(dailyTodoRepository.findAll).toHaveBeenCalledWith(
        dummyUserId,
        dummyDate,
      );
      expect(result).toHaveLength(1);
      expect(result[0].getTitle).toBe("Sample");
      expect(result[0].getOwner.getUsername.toString()).toBe("Robin");
      expect(result[0].getCategory?.getTitle).toBe("Work");
    });

    it("should return empty array when no todos exist", async () => {
      dailyTodoRepository.findAll.mockResolvedValue([]);

      const result = await dailyTodoQueryAdapter.findAll(
        dummyUserId,
        dummyDate,
      );

      expect(result).toEqual([]);
    });
  });

  describe("findById()", () => {
    it("should return mapped DailyTodoWithRelationEntity if found", async () => {
      const dailyTodoId = new DailyTodoId(new Types.ObjectId());

      dailyTodoRepository.findById.mockResolvedValue({
        _id: dailyTodoId.toString(),
        title: "Sample",
        date: new Date(dummyDate.value),
        reaction: null,
        progress: DailyTodoCompleteStatus.PROGRESS,
        cycle: DailyTodoCycle.EVERYDAY,
        owner: {
          id: dummyUserId.toString(),
          username: "Robin",
          nickname: "Robin",
        },
        category: {
          id: new CategoryId(new Types.ObjectId()).toString(),
          title: "Category",
        },
      });

      const result = await dailyTodoQueryAdapter.findById(
        dailyTodoId,
        dummyUserId,
      );

      expect(dailyTodoRepository.findById).toHaveBeenCalledWith(
        dailyTodoId,
        dummyUserId,
      );
      expect(result.getTitle).toBe("Sample");
      expect(result.getCategory.getTitle).toBe("Category");
    });

    it("should throw NotFoundException if not found", async () => {
      const dailyTodoId = new DailyTodoId(new Types.ObjectId());
      dailyTodoRepository.findById.mockResolvedValue(null);

      await expect(
        dailyTodoQueryAdapter.findById(dailyTodoId, dummyUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
