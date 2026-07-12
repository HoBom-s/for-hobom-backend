import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { ProcessDailyTodoRecurrenceService } from "src/hb-backend-api/daily-todo/application/use-cases/process-daily-todo-recurrence.service";
import { DailyTodoPersistencePort } from "src/hb-backend-api/daily-todo/application/ports/out/daily-todo-persistence.port";
import { DIToken } from "src/shared/di/token.di";
import { TransactionRunner } from "src/infra/mongo/transaction/transaction.runner";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { CategoryId } from "src/hb-backend-api/category/domain/model/category-id.vo";
import { DailyTodoCycle } from "src/hb-backend-api/daily-todo/domain/enums/daily-todo-cycle.enum";

const mockPersistencePort = () => ({
  save: jest.fn(),
  saveAll: jest.fn(),
  deleteDailyTodoById: jest.fn(),
  updateDailyTodoCompleteStatus: jest.fn(),
  updateDailyTodoCycle: jest.fn(),
  updateDailyTodoReaction: jest.fn(),
  update: jest.fn(),
  findByDateRangeAndCycles: jest.fn(),
});

const makeTodo = (cycle: DailyTodoCycle = DailyTodoCycle.EVERYDAY) => ({
  title: "반복 할일",
  owner: new UserId(new Types.ObjectId()),
  category: new CategoryId(new Types.ObjectId()),
  cycle,
});

describe("ProcessDailyTodoRecurrenceService", () => {
  let service: ProcessDailyTodoRecurrenceService;
  let persistencePort: jest.Mocked<DailyTodoPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessDailyTodoRecurrenceService,
        {
          provide: DIToken.DailyTodoModule.DailyTodoPersistencePort,
          useValue: mockPersistencePort(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(ProcessDailyTodoRecurrenceService);
    persistencePort = module.get(
      DIToken.DailyTodoModule.DailyTodoPersistencePort,
    );
  });

  it("반복 할일이 없으면 saveAll을 호출하지 않아야 한다", async () => {
    persistencePort.findByDateRangeAndCycles.mockResolvedValue([]);

    await service.invoke();

    expect(persistencePort.findByDateRangeAndCycles).toHaveBeenCalledTimes(1);
    expect(persistencePort.saveAll).not.toHaveBeenCalled();
  });

  it("반복 할일이 있으면 오늘 날짜로 새 엔티티를 생성해야 한다", async () => {
    const todos = [makeTodo(), makeTodo(DailyTodoCycle.EVERYDAY)];
    persistencePort.findByDateRangeAndCycles.mockResolvedValue(todos);
    persistencePort.saveAll.mockResolvedValue(undefined);

    await service.invoke();

    expect(persistencePort.saveAll).toHaveBeenCalledTimes(1);
    const savedEntities = persistencePort.saveAll.mock.calls[0][0];
    expect(savedEntities).toHaveLength(2);
  });

  it("findByDateRangeAndCycles에 올바른 cycles를 전달해야 한다", async () => {
    persistencePort.findByDateRangeAndCycles.mockResolvedValue([]);

    await service.invoke();

    const calledCycles =
      persistencePort.findByDateRangeAndCycles.mock.calls[0][2];
    expect(calledCycles).toContain(DailyTodoCycle.EVERYDAY);
    expect(
      calledCycles.includes(DailyTodoCycle.EVERY_WEEKDAY) ||
        calledCycles.includes(DailyTodoCycle.EVERY_WEEKEND),
    ).toBe(true);
  });

  it("에러가 발생하면 전파되어야 한다", async () => {
    persistencePort.findByDateRangeAndCycles.mockRejectedValue(
      new Error("DB error"),
    );

    await expect(service.invoke()).rejects.toThrow("DB error");
  });
});
