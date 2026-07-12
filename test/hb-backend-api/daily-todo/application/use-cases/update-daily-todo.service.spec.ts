import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { UpdateDailyTodoService } from "src/hb-backend-api/daily-todo/application/use-cases/update-daily-todo.service";
import { DIToken } from "src/shared/di/token.di";
import { TransactionRunner } from "src/infra/mongo/transaction/transaction.runner";
import { DailyTodoId } from "src/hb-backend-api/daily-todo/domain/vo/daily-todo-id.vo";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { UpdateDailyTodoCommand } from "src/hb-backend-api/daily-todo/application/command/update-daily-todo.command";
import { CategoryId } from "src/hb-backend-api/category/domain/model/category-id.vo";
import {
  DailyTodoWithRelationEntity,
  Owner,
  Category,
} from "src/hb-backend-api/daily-todo/domain/entity/daily-todo.retations";
import { DailyTodoCompleteStatus } from "src/hb-backend-api/daily-todo/domain/enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "src/hb-backend-api/daily-todo/domain/enums/daily-todo-cycle.enum";

const ownerId = UserId.fromString(new Types.ObjectId().toHexString());
const todoId = DailyTodoId.fromString(new Types.ObjectId().toHexString());
const catId = CategoryId.fromString(new Types.ObjectId().toHexString());

const makeTodoEntity = () =>
  DailyTodoWithRelationEntity.of(
    todoId,
    "할일",
    new Date(),
    null,
    DailyTodoCompleteStatus.PROGRESS,
    DailyTodoCycle.EVERYDAY,
    Owner.of(ownerId, "user", "nick"),
    Category.of(catId, "카테고리"),
  );

describe("UpdateDailyTodoService", () => {
  let service: UpdateDailyTodoService;
  const mockFindById = jest.fn();
  const mockUpdate = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    mockFindById.mockResolvedValue(makeTodoEntity());
    mockUpdate.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateDailyTodoService,
        {
          provide: DIToken.DailyTodoModule.DailyTodoPersistencePort,
          useValue: { update: mockUpdate },
        },
        {
          provide: DIToken.DailyTodoModule.DailyTodoQueryPort,
          useValue: { findById: mockFindById },
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb: () => unknown) => cb()) },
        },
      ],
    }).compile();

    service = module.get(UpdateDailyTodoService);
  });

  it("title만 변경할 때 title만 업데이트해야 한다", async () => {
    const command = UpdateDailyTodoCommand.of("새 제목");
    await service.invoke(todoId, ownerId, command);

    expect(mockUpdate).toHaveBeenCalledWith(
      todoId,
      ownerId,
      expect.objectContaining({ title: "새 제목" }),
    );
  });

  it("date만 변경할 때 date만 업데이트해야 한다", async () => {
    const newDate = new Date("2026-04-01");
    const command = UpdateDailyTodoCommand.of(undefined, newDate);
    await service.invoke(todoId, ownerId, command);

    expect(mockUpdate).toHaveBeenCalledWith(
      todoId,
      ownerId,
      expect.objectContaining({ date: newDate }),
    );
  });

  it("category만 변경할 때 category만 업데이트해야 한다", async () => {
    const newCat = CategoryId.fromString(new Types.ObjectId().toHexString());
    const command = UpdateDailyTodoCommand.of(undefined, undefined, newCat);
    await service.invoke(todoId, ownerId, command);

    expect(mockUpdate).toHaveBeenCalledWith(
      todoId,
      ownerId,
      expect.objectContaining({ category: newCat }),
    );
  });

  it("변경 사항이 없을 때 update를 호출하지 않아야 한다", async () => {
    const command = UpdateDailyTodoCommand.of();
    await service.invoke(todoId, ownerId, command);

    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
