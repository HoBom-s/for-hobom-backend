import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { CreateBoardService } from "src/hb-backend-api/board/application/use-cases/create-board.service";
import { GetBoardService } from "src/hb-backend-api/board/application/use-cases/get-board.service";
import { GetBoardsByProjectService } from "src/hb-backend-api/board/application/use-cases/get-boards-by-project.service";
import { UpdateBoardService } from "src/hb-backend-api/board/application/use-cases/update-board.service";
import { DeleteBoardService } from "src/hb-backend-api/board/application/use-cases/delete-board.service";
import { BoardPersistencePort } from "src/hb-backend-api/board/ports/out/board-persistence.port";
import { BoardQueryPort } from "src/hb-backend-api/board/ports/out/board-query.port";
import { DIToken } from "src/shared/di/token.di";
import { TransactionRunner } from "src/infra/mongo/transaction/transaction.runner";
import { BoardId } from "src/hb-backend-api/board/domain/model/board-id.vo";
import { ProjectId } from "src/hb-backend-api/project/domain/model/project-id.vo";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { BoardType } from "src/hb-backend-api/board/domain/enums/board-type.enum";

const makeBoardDoc = (overrides: Record<string, unknown> = {}) => ({
  _id: new Types.ObjectId(),
  project: new Types.ObjectId(),
  name: "Kanban Board",
  type: "KANBAN",
  columns: [],
  filters: {},
  createdBy: new Types.ObjectId(),
  ...overrides,
});

const boardPersistenceMock = (): Record<string, jest.Mock> => ({
  save: jest.fn(),
  update: jest.fn(),
  deleteOne: jest.fn(),
  deleteByProject: jest.fn(),
});

const boardQueryMock = (): Record<string, jest.Mock> => ({
  findById: jest.fn(),
  findByProject: jest.fn(),
});

// ──────────────────────────────────────────────
// CreateBoardService
// ──────────────────────────────────────────────
describe("CreateBoardService", () => {
  let service: CreateBoardService;
  let persistencePort: jest.Mocked<BoardPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBoardService,
        {
          provide: DIToken.BoardModule.BoardPersistencePort,
          useValue: boardPersistenceMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(CreateBoardService);
    persistencePort = module.get(DIToken.BoardModule.BoardPersistencePort);
  });

  it("보드를 정상적으로 생성해야 한다", async () => {
    persistencePort.save.mockResolvedValue(undefined);

    const projectId = new ProjectId(new Types.ObjectId());
    const createdBy = new UserId(new Types.ObjectId());

    await service.invoke(
      projectId,
      "Kanban Board",
      BoardType.KANBAN,
      createdBy,
    );

    expect(persistencePort.save).toHaveBeenCalledTimes(1);
  });
});

// ──────────────────────────────────────────────
// GetBoardService
// ──────────────────────────────────────────────
describe("GetBoardService", () => {
  let service: GetBoardService;
  let queryPort: jest.Mocked<BoardQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBoardService,
        {
          provide: DIToken.BoardModule.BoardQueryPort,
          useValue: boardQueryMock(),
        },
      ],
    }).compile();

    service = module.get(GetBoardService);
    queryPort = module.get(DIToken.BoardModule.BoardQueryPort);
  });

  it("ID로 보드를 정상적으로 조회해야 한다", async () => {
    const doc = makeBoardDoc();
    queryPort.findById.mockResolvedValue(doc as never);

    const id = new BoardId(new Types.ObjectId());
    const result = await service.invoke(id);

    expect(queryPort.findById).toHaveBeenCalledWith(id);
    expect(result).toBeDefined();
  });
});

// ──────────────────────────────────────────────
// GetBoardsByProjectService
// ──────────────────────────────────────────────
describe("GetBoardsByProjectService", () => {
  let service: GetBoardsByProjectService;
  let queryPort: jest.Mocked<BoardQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBoardsByProjectService,
        {
          provide: DIToken.BoardModule.BoardQueryPort,
          useValue: boardQueryMock(),
        },
      ],
    }).compile();

    service = module.get(GetBoardsByProjectService);
    queryPort = module.get(DIToken.BoardModule.BoardQueryPort);
  });

  it("프로젝트별 보드 배열을 반환해야 한다", async () => {
    queryPort.findByProject.mockResolvedValue([makeBoardDoc() as never]);

    const projectId = new ProjectId(new Types.ObjectId());
    const result = await service.invoke(projectId);

    expect(result).toHaveLength(1);
    expect(queryPort.findByProject).toHaveBeenCalledWith(projectId);
  });
});

// ──────────────────────────────────────────────
// UpdateBoardService
// ──────────────────────────────────────────────
describe("UpdateBoardService", () => {
  let service: UpdateBoardService;
  let persistencePort: jest.Mocked<BoardPersistencePort>;
  let queryPort: jest.Mocked<BoardQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBoardService,
        {
          provide: DIToken.BoardModule.BoardPersistencePort,
          useValue: boardPersistenceMock(),
        },
        {
          provide: DIToken.BoardModule.BoardQueryPort,
          useValue: boardQueryMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(UpdateBoardService);
    persistencePort = module.get(DIToken.BoardModule.BoardPersistencePort);
    queryPort = module.get(DIToken.BoardModule.BoardQueryPort);
  });

  it("보드를 정상적으로 수정해야 한다", async () => {
    queryPort.findById.mockResolvedValue(makeBoardDoc() as never);
    persistencePort.update.mockResolvedValue(undefined);

    const id = new BoardId(new Types.ObjectId());
    await service.invoke(id, { name: "Updated Board" });

    expect(queryPort.findById).toHaveBeenCalledWith(id);
    expect(persistencePort.update).toHaveBeenCalledWith(id, {
      name: "Updated Board",
    });
  });
});

// ──────────────────────────────────────────────
// DeleteBoardService
// ──────────────────────────────────────────────
describe("DeleteBoardService", () => {
  let service: DeleteBoardService;
  let persistencePort: jest.Mocked<BoardPersistencePort>;
  let queryPort: jest.Mocked<BoardQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteBoardService,
        {
          provide: DIToken.BoardModule.BoardPersistencePort,
          useValue: boardPersistenceMock(),
        },
        {
          provide: DIToken.BoardModule.BoardQueryPort,
          useValue: boardQueryMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(DeleteBoardService);
    persistencePort = module.get(DIToken.BoardModule.BoardPersistencePort);
    queryPort = module.get(DIToken.BoardModule.BoardQueryPort);
  });

  it("보드를 정상적으로 삭제해야 한다", async () => {
    queryPort.findById.mockResolvedValue(makeBoardDoc() as never);
    persistencePort.deleteOne.mockResolvedValue(undefined);

    const id = new BoardId(new Types.ObjectId());
    await service.invoke(id);

    expect(queryPort.findById).toHaveBeenCalledWith(id);
    expect(persistencePort.deleteOne).toHaveBeenCalledWith(id);
  });
});
