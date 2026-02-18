import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { CreateDailyTodoService } from "../../../../../src/hb-backend-api/daily-todo/application/use-cases/create-daily-todo.service";
import { GetAllDailyTodoService } from "../../../../../src/hb-backend-api/daily-todo/application/use-cases/get-all-daily-todo.service";
import { GetDailyTodoByDateService } from "../../../../../src/hb-backend-api/daily-todo/application/use-cases/get-daily-todo-by-date.service";
import { DeleteDailyTodoService } from "../../../../../src/hb-backend-api/daily-todo/application/use-cases/delete-daily-todo.service";
import { UpdateDailyTodoCompleteStatusService } from "../../../../../src/hb-backend-api/daily-todo/application/use-cases/update-daily-todo-complete-status.service";
import { UpdateDailyTodoCycleService } from "../../../../../src/hb-backend-api/daily-todo/application/use-cases/update-daily-todo-cycle.service";
import { UpdateDailyTodoReactionService } from "../../../../../src/hb-backend-api/daily-todo/application/use-cases/update-daily-todo-reaction.service";
import { DailyTodoPersistencePort } from "../../../../../src/hb-backend-api/daily-todo/application/ports/out/daily-todo-persistence.port";
import { DailyTodoQueryPort } from "../../../../../src/hb-backend-api/daily-todo/application/ports/out/daily-todo-query.port";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { TransactionRunner } from "../../../../../src/infra/mongo/transaction/transaction.runner";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { CategoryId } from "../../../../../src/hb-backend-api/category/domain/model/category-id.vo";
import { DailyTodoId } from "../../../../../src/hb-backend-api/daily-todo/domain/vo/daily-todo-id.vo";
import { YearMonthDayString } from "../../../../../src/hb-backend-api/daily-todo/domain/vo/year-month-day-string.vo";
import { CreateDailyTodoCommand } from "../../../../../src/hb-backend-api/daily-todo/application/command/create-daily-todo.command";
import { UpdateDailyTodoCompleteStatusCommand } from "../../../../../src/hb-backend-api/daily-todo/application/command/update-daily-todo-complete-status.command";
import { UpdateDailyTodoCycleCommand } from "../../../../../src/hb-backend-api/daily-todo/application/command/update-daily-todo-cycle.command";
import { UpdateDailyTodoReactionCommand } from "../../../../../src/hb-backend-api/daily-todo/application/command/update-daily-todo-reaction.command";
import { DailyTodoCompleteStatus } from "../../../../../src/hb-backend-api/daily-todo/domain/enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "../../../../../src/hb-backend-api/daily-todo/domain/enums/daily-todo-cycle.enum";
import {
  Category,
  DailyTodoWithRelationEntity,
  Owner,
  Reaction,
} from "../../../../../src/hb-backend-api/daily-todo/domain/entity/daily-todo.retations";

// ──────────────────────────────────────────────
// Test Factories
// ──────────────────────────────────────────────
const makeOwnerId = () => new UserId(new Types.ObjectId());
const makeCategoryId = () => new CategoryId(new Types.ObjectId());
const makeDailyTodoId = () => new DailyTodoId(new Types.ObjectId());
const makeDate = () => YearMonthDayString.fromString("2026-02-19");

const makeOwner = (id = makeOwnerId()) => Owner.of(id, "testuser", "테스트");

const makeCategory = (id = makeCategoryId()) => Category.of(id, "운동");

const makeDailyTodoEntity = (
  id = makeDailyTodoId(),
  owner = makeOwner(),
  category = makeCategory(),
): DailyTodoWithRelationEntity =>
  DailyTodoWithRelationEntity.of(
    id,
    "테스트 할일",
    new Date("2026-02-19"),
    null,
    DailyTodoCompleteStatus.PROGRESS,
    DailyTodoCycle.EVERYDAY,
    owner,
    category,
  );

const mockPersistencePort = () => ({
  save: jest.fn(),
  deleteDailyTodoById: jest.fn(),
  updateDailyTodoCompleteStatus: jest.fn(),
  updateDailyTodoCycle: jest.fn(),
  updateDailyTodoReaction: jest.fn(),
});

const mockQueryPort = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByDate: jest.fn(),
});

// ──────────────────────────────────────────────
// CreateDailyTodoService
// ──────────────────────────────────────────────
describe("CreateDailyTodoService", () => {
  let service: CreateDailyTodoService;
  let persistencePort: jest.Mocked<DailyTodoPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateDailyTodoService,
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

    service = module.get(CreateDailyTodoService);
    persistencePort = module.get(
      DIToken.DailyTodoModule.DailyTodoPersistencePort,
    );
  });

  it("PROGRESS 상태, EVERYDAY 주기로 DailyTodo를 생성해야 한다", async () => {
    persistencePort.save.mockResolvedValue(undefined);

    const owner = makeOwnerId();
    const command = CreateDailyTodoCommand.of(
      "운동하기",
      new Date("2026-02-19"),
      makeCategoryId(),
    );

    await service.invoke(command, owner);

    expect(persistencePort.save).toHaveBeenCalledTimes(1);
    const saved = persistencePort.save.mock.calls[0][0];
    expect(saved.getProgress).toBe(DailyTodoCompleteStatus.PROGRESS);
    expect(saved.getCycle).toBe(DailyTodoCycle.EVERYDAY);
    expect(saved.getTitle).toBe("운동하기");
  });
});

// ──────────────────────────────────────────────
// GetAllDailyTodoService
// ──────────────────────────────────────────────
describe("GetAllDailyTodoService", () => {
  let service: GetAllDailyTodoService;
  let queryPort: jest.Mocked<DailyTodoQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllDailyTodoService,
        {
          provide: DIToken.DailyTodoModule.DailyTodoQueryPort,
          useValue: mockQueryPort(),
        },
      ],
    }).compile();

    service = module.get(GetAllDailyTodoService);
    queryPort = module.get(DIToken.DailyTodoModule.DailyTodoQueryPort);
  });

  it("날짜에 해당하는 DailyTodo 목록을 반환해야 한다", async () => {
    const owner = makeOwnerId();
    const date = makeDate();
    queryPort.findAll.mockResolvedValue([
      makeDailyTodoEntity(),
      makeDailyTodoEntity(),
    ]);

    const result = await service.invoke(owner, date);

    expect(queryPort.findAll).toHaveBeenCalledWith(owner, date);
    expect(result).toHaveLength(2);
  });

  it("해당 날짜에 DailyTodo가 없으면 빈 배열을 반환해야 한다", async () => {
    queryPort.findAll.mockResolvedValue([]);

    const result = await service.invoke(makeOwnerId(), makeDate());

    expect(result).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// GetDailyTodoByDateService
// ──────────────────────────────────────────────
describe("GetDailyTodoByDateService", () => {
  let service: GetDailyTodoByDateService;
  let queryPort: jest.Mocked<DailyTodoQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDailyTodoByDateService,
        {
          provide: DIToken.DailyTodoModule.DailyTodoQueryPort,
          useValue: mockQueryPort(),
        },
      ],
    }).compile();

    service = module.get(GetDailyTodoByDateService);
    queryPort = module.get(DIToken.DailyTodoModule.DailyTodoQueryPort);
  });

  it("날짜 기준으로 DailyTodo 목록을 조회해야 한다", async () => {
    const owner = makeOwnerId();
    const date = makeDate();
    queryPort.findByDate.mockResolvedValue([makeDailyTodoEntity()]);

    const result = await service.invoke(owner, date);

    expect(queryPort.findByDate).toHaveBeenCalledWith(owner, date);
    expect(result).toHaveLength(1);
  });
});

// ──────────────────────────────────────────────
// UpdateDailyTodoCompleteStatusService
// ──────────────────────────────────────────────
describe("UpdateDailyTodoCompleteStatusService", () => {
  let service: UpdateDailyTodoCompleteStatusService;
  let queryPort: jest.Mocked<DailyTodoQueryPort>;
  let persistencePort: jest.Mocked<DailyTodoPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateDailyTodoCompleteStatusService,
        {
          provide: DIToken.DailyTodoModule.DailyTodoPersistencePort,
          useValue: mockPersistencePort(),
        },
        {
          provide: DIToken.DailyTodoModule.DailyTodoQueryPort,
          useValue: mockQueryPort(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(UpdateDailyTodoCompleteStatusService);
    queryPort = module.get(DIToken.DailyTodoModule.DailyTodoQueryPort);
    persistencePort = module.get(
      DIToken.DailyTodoModule.DailyTodoPersistencePort,
    );
  });

  it("DailyTodo를 조회한 후 완료 상태를 변경해야 한다", async () => {
    const owner = makeOwner();
    const entity = makeDailyTodoEntity(makeDailyTodoId(), owner);
    queryPort.findById.mockResolvedValue(entity);
    persistencePort.updateDailyTodoCompleteStatus.mockResolvedValue(undefined);

    const command = UpdateDailyTodoCompleteStatusCommand.of(
      DailyTodoCompleteStatus.COMPLETED,
    );
    await service.invoke(entity.getId, owner.getId, command);

    expect(queryPort.findById).toHaveBeenCalledWith(entity.getId, owner.getId);
    expect(persistencePort.updateDailyTodoCompleteStatus).toHaveBeenCalledWith(
      entity.getId,
      owner.getId,
      DailyTodoCompleteStatus.COMPLETED,
    );
  });
});

// ──────────────────────────────────────────────
// UpdateDailyTodoCycleService
// ──────────────────────────────────────────────
describe("UpdateDailyTodoCycleService", () => {
  let service: UpdateDailyTodoCycleService;
  let queryPort: jest.Mocked<DailyTodoQueryPort>;
  let persistencePort: jest.Mocked<DailyTodoPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateDailyTodoCycleService,
        {
          provide: DIToken.DailyTodoModule.DailyTodoPersistencePort,
          useValue: mockPersistencePort(),
        },
        {
          provide: DIToken.DailyTodoModule.DailyTodoQueryPort,
          useValue: mockQueryPort(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(UpdateDailyTodoCycleService);
    queryPort = module.get(DIToken.DailyTodoModule.DailyTodoQueryPort);
    persistencePort = module.get(
      DIToken.DailyTodoModule.DailyTodoPersistencePort,
    );
  });

  it("DailyTodo를 조회한 후 반복 주기를 변경해야 한다", async () => {
    const owner = makeOwner();
    const entity = makeDailyTodoEntity(makeDailyTodoId(), owner);
    queryPort.findById.mockResolvedValue(entity);
    persistencePort.updateDailyTodoCycle.mockResolvedValue(undefined);

    const command = UpdateDailyTodoCycleCommand.of(
      DailyTodoCycle.EVERY_WEEKDAY,
    );
    await service.invoke(entity.getId, owner.getId, command);

    expect(queryPort.findById).toHaveBeenCalledWith(entity.getId, owner.getId);
    expect(persistencePort.updateDailyTodoCycle).toHaveBeenCalledWith(
      entity.getId,
      owner.getId,
      DailyTodoCycle.EVERY_WEEKDAY,
    );
  });
});

// ──────────────────────────────────────────────
// UpdateDailyTodoReactionService
// ──────────────────────────────────────────────
describe("UpdateDailyTodoReactionService", () => {
  let service: UpdateDailyTodoReactionService;
  let queryPort: jest.Mocked<DailyTodoQueryPort>;
  let persistencePort: jest.Mocked<DailyTodoPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateDailyTodoReactionService,
        {
          provide: DIToken.DailyTodoModule.DailyTodoPersistencePort,
          useValue: mockPersistencePort(),
        },
        {
          provide: DIToken.DailyTodoModule.DailyTodoQueryPort,
          useValue: mockQueryPort(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(UpdateDailyTodoReactionService);
    queryPort = module.get(DIToken.DailyTodoModule.DailyTodoQueryPort);
    persistencePort = module.get(
      DIToken.DailyTodoModule.DailyTodoPersistencePort,
    );
  });

  it("DailyTodo를 조회한 후 리액션을 업데이트해야 한다", async () => {
    const owner = makeOwner();
    const entity = makeDailyTodoEntity(makeDailyTodoId(), owner);
    queryPort.findById.mockResolvedValue(entity);
    persistencePort.updateDailyTodoReaction.mockResolvedValue(undefined);

    const reaction = Reaction.of("👍", owner.getId);
    const command = UpdateDailyTodoReactionCommand.of(reaction);
    await service.invoke(entity.getId, owner.getId, command);

    expect(queryPort.findById).toHaveBeenCalledWith(entity.getId, owner.getId);
    expect(persistencePort.updateDailyTodoReaction).toHaveBeenCalledWith(
      entity.getId,
      owner.getId,
      reaction,
    );
  });
});

// ──────────────────────────────────────────────
// DeleteDailyTodoService
// ──────────────────────────────────────────────
describe("DeleteDailyTodoService", () => {
  let service: DeleteDailyTodoService;
  let queryPort: jest.Mocked<DailyTodoQueryPort>;
  let persistencePort: jest.Mocked<DailyTodoPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteDailyTodoService,
        {
          provide: DIToken.DailyTodoModule.DailyTodoPersistencePort,
          useValue: mockPersistencePort(),
        },
        {
          provide: DIToken.DailyTodoModule.DailyTodoQueryPort,
          useValue: mockQueryPort(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(DeleteDailyTodoService);
    queryPort = module.get(DIToken.DailyTodoModule.DailyTodoQueryPort);
    persistencePort = module.get(
      DIToken.DailyTodoModule.DailyTodoPersistencePort,
    );
  });

  it("DailyTodo를 조회한 후 삭제해야 한다", async () => {
    const owner = makeOwner();
    const entity = makeDailyTodoEntity(makeDailyTodoId(), owner);
    queryPort.findById.mockResolvedValue(entity);
    persistencePort.deleteDailyTodoById.mockResolvedValue(undefined);

    await service.invoke(entity.getId, owner.getId);

    expect(queryPort.findById).toHaveBeenCalledWith(entity.getId, owner.getId);
    expect(persistencePort.deleteDailyTodoById).toHaveBeenCalledWith(
      entity.getId,
      owner.getId,
    );
  });
});
