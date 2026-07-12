import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";
import { CreateSprintService } from "src/hb-backend-api/sprint/application/use-cases/create-sprint.service";
import { GetSprintService } from "src/hb-backend-api/sprint/application/use-cases/get-sprint.service";
import { GetSprintsByProjectService } from "src/hb-backend-api/sprint/application/use-cases/get-sprints-by-project.service";
import { UpdateSprintService } from "src/hb-backend-api/sprint/application/use-cases/update-sprint.service";
import { DeleteSprintService } from "src/hb-backend-api/sprint/application/use-cases/delete-sprint.service";
import { StartSprintService } from "src/hb-backend-api/sprint/application/use-cases/start-sprint.service";
import { CompleteSprintService } from "src/hb-backend-api/sprint/application/use-cases/complete-sprint.service";
import { SprintPersistencePort } from "src/hb-backend-api/sprint/ports/out/sprint-persistence.port";
import { SprintQueryPort } from "src/hb-backend-api/sprint/ports/out/sprint-query.port";
import { DIToken } from "src/shared/di/token.di";
import { TransactionRunner } from "src/infra/mongo/transaction/transaction.runner";
import { SprintId } from "src/hb-backend-api/sprint/domain/model/sprint-id.vo";
import { ProjectId } from "src/hb-backend-api/project/domain/model/project-id.vo";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";

const makeSprintDoc = (overrides: Record<string, unknown> = {}) => ({
  _id: new Types.ObjectId(),
  project: new Types.ObjectId(),
  name: "Sprint 1",
  goal: null,
  status: "PLANNING",
  startDate: new Date(),
  endDate: new Date(Date.now() + 86400000),
  completedAt: null,
  createdBy: new Types.ObjectId(),
  ...overrides,
});

const sprintPersistenceMock = (): Record<string, jest.Mock> => ({
  save: jest.fn(),
  update: jest.fn(),
  deleteOne: jest.fn(),
  deleteByProject: jest.fn(),
});

const sprintQueryMock = (): Record<string, jest.Mock> => ({
  findById: jest.fn(),
  findByProject: jest.fn(),
  findActiveSprint: jest.fn(),
});

// ──────────────────────────────────────────────
// CreateSprintService
// ──────────────────────────────────────────────
describe("CreateSprintService", () => {
  let service: CreateSprintService;
  let persistencePort: jest.Mocked<SprintPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSprintService,
        {
          provide: DIToken.SprintModule.SprintPersistencePort,
          useValue: sprintPersistenceMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(CreateSprintService);
    persistencePort = module.get(DIToken.SprintModule.SprintPersistencePort);
  });

  it("스프린트를 정상적으로 생성해야 한다", async () => {
    persistencePort.save.mockResolvedValue(undefined);

    const projectId = new ProjectId(new Types.ObjectId());
    const createdBy = new UserId(new Types.ObjectId());
    const startDate = new Date("2026-03-01");
    const endDate = new Date("2026-03-15");

    await service.invoke(
      projectId,
      "Sprint 1",
      null,
      startDate,
      endDate,
      createdBy,
    );

    expect(persistencePort.save).toHaveBeenCalledTimes(1);
  });

  it("시작일이 종료일 이후이면 BadRequestException을 던져야 한다", async () => {
    const projectId = new ProjectId(new Types.ObjectId());
    const createdBy = new UserId(new Types.ObjectId());
    const startDate = new Date("2026-03-15");
    const endDate = new Date("2026-03-01");

    await expect(
      service.invoke(
        projectId,
        "Sprint 1",
        null,
        startDate,
        endDate,
        createdBy,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(persistencePort.save).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// GetSprintService
// ──────────────────────────────────────────────
describe("GetSprintService", () => {
  let service: GetSprintService;
  let queryPort: jest.Mocked<SprintQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSprintService,
        {
          provide: DIToken.SprintModule.SprintQueryPort,
          useValue: sprintQueryMock(),
        },
      ],
    }).compile();

    service = module.get(GetSprintService);
    queryPort = module.get(DIToken.SprintModule.SprintQueryPort);
  });

  it("ID로 스프린트를 정상적으로 조회해야 한다", async () => {
    const doc = makeSprintDoc();
    queryPort.findById.mockResolvedValue(doc as never);

    const id = new SprintId(new Types.ObjectId());
    const result = await service.invoke(id);

    expect(queryPort.findById).toHaveBeenCalledWith(id);
    expect(result).toBeDefined();
  });
});

// ──────────────────────────────────────────────
// GetSprintsByProjectService
// ──────────────────────────────────────────────
describe("GetSprintsByProjectService", () => {
  let service: GetSprintsByProjectService;
  let queryPort: jest.Mocked<SprintQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSprintsByProjectService,
        {
          provide: DIToken.SprintModule.SprintQueryPort,
          useValue: sprintQueryMock(),
        },
      ],
    }).compile();

    service = module.get(GetSprintsByProjectService);
    queryPort = module.get(DIToken.SprintModule.SprintQueryPort);
  });

  it("프로젝트별 스프린트 배열을 반환해야 한다", async () => {
    queryPort.findByProject.mockResolvedValue([makeSprintDoc() as never]);

    const projectId = new ProjectId(new Types.ObjectId());
    const result = await service.invoke(projectId);

    expect(result).toHaveLength(1);
    expect(queryPort.findByProject).toHaveBeenCalledWith(projectId);
  });

  it("스프린트가 없으면 빈 배열을 반환해야 한다", async () => {
    queryPort.findByProject.mockResolvedValue([]);

    const projectId = new ProjectId(new Types.ObjectId());
    const result = await service.invoke(projectId);

    expect(result).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// UpdateSprintService
// ──────────────────────────────────────────────
describe("UpdateSprintService", () => {
  let service: UpdateSprintService;
  let persistencePort: jest.Mocked<SprintPersistencePort>;
  let queryPort: jest.Mocked<SprintQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateSprintService,
        {
          provide: DIToken.SprintModule.SprintPersistencePort,
          useValue: sprintPersistenceMock(),
        },
        {
          provide: DIToken.SprintModule.SprintQueryPort,
          useValue: sprintQueryMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(UpdateSprintService);
    persistencePort = module.get(DIToken.SprintModule.SprintPersistencePort);
    queryPort = module.get(DIToken.SprintModule.SprintQueryPort);
  });

  it("PLANNING 상태의 스프린트를 정상적으로 수정해야 한다", async () => {
    queryPort.findById.mockResolvedValue(
      makeSprintDoc({ status: "PLANNING" }) as never,
    );
    persistencePort.update.mockResolvedValue(undefined);

    const id = new SprintId(new Types.ObjectId());
    await service.invoke(id, "Updated Sprint", "goal", new Date(), new Date());

    expect(persistencePort.update).toHaveBeenCalledTimes(1);
  });

  it("PLANNING이 아닌 상태의 스프린트를 수정하면 BadRequestException을 던져야 한다", async () => {
    queryPort.findById.mockResolvedValue(
      makeSprintDoc({ status: "ACTIVE" }) as never,
    );

    const id = new SprintId(new Types.ObjectId());

    await expect(
      service.invoke(id, "Updated Sprint", null, new Date(), new Date()),
    ).rejects.toThrow(BadRequestException);

    expect(persistencePort.update).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// DeleteSprintService
// ──────────────────────────────────────────────
describe("DeleteSprintService", () => {
  let service: DeleteSprintService;
  let persistencePort: jest.Mocked<SprintPersistencePort>;
  let queryPort: jest.Mocked<SprintQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteSprintService,
        {
          provide: DIToken.SprintModule.SprintPersistencePort,
          useValue: sprintPersistenceMock(),
        },
        {
          provide: DIToken.SprintModule.SprintQueryPort,
          useValue: sprintQueryMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(DeleteSprintService);
    persistencePort = module.get(DIToken.SprintModule.SprintPersistencePort);
    queryPort = module.get(DIToken.SprintModule.SprintQueryPort);
  });

  it("스프린트를 정상적으로 삭제해야 한다", async () => {
    queryPort.findById.mockResolvedValue(makeSprintDoc() as never);
    persistencePort.deleteOne.mockResolvedValue(undefined);

    const id = new SprintId(new Types.ObjectId());
    await service.invoke(id);

    expect(queryPort.findById).toHaveBeenCalledWith(id);
    expect(persistencePort.deleteOne).toHaveBeenCalledWith(id);
  });
});

// ──────────────────────────────────────────────
// StartSprintService
// ──────────────────────────────────────────────
describe("StartSprintService", () => {
  let service: StartSprintService;
  let persistencePort: jest.Mocked<SprintPersistencePort>;
  let queryPort: jest.Mocked<SprintQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartSprintService,
        {
          provide: DIToken.SprintModule.SprintPersistencePort,
          useValue: sprintPersistenceMock(),
        },
        {
          provide: DIToken.SprintModule.SprintQueryPort,
          useValue: sprintQueryMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(StartSprintService);
    persistencePort = module.get(DIToken.SprintModule.SprintPersistencePort);
    queryPort = module.get(DIToken.SprintModule.SprintQueryPort);
  });

  it("PLANNING 상태의 스프린트를 정상적으로 시작해야 한다", async () => {
    const projectId = new Types.ObjectId();
    queryPort.findById.mockResolvedValue(
      makeSprintDoc({ status: "PLANNING", project: projectId }) as never,
    );
    queryPort.findActiveSprint.mockResolvedValue(null);
    persistencePort.update.mockResolvedValue(undefined);

    const id = new SprintId(new Types.ObjectId());
    await service.invoke(id);

    expect(persistencePort.update).toHaveBeenCalledWith(id, {
      status: "ACTIVE",
    });
  });

  it("PLANNING이 아닌 상태의 스프린트를 시작하면 BadRequestException을 던져야 한다", async () => {
    queryPort.findById.mockResolvedValue(
      makeSprintDoc({ status: "ACTIVE" }) as never,
    );

    const id = new SprintId(new Types.ObjectId());

    await expect(service.invoke(id)).rejects.toThrow(BadRequestException);

    expect(persistencePort.update).not.toHaveBeenCalled();
  });

  it("이미 진행 중인 스프린트가 존재하면 BadRequestException을 던져야 한다", async () => {
    const projectId = new Types.ObjectId();
    queryPort.findById.mockResolvedValue(
      makeSprintDoc({ status: "PLANNING", project: projectId }) as never,
    );
    queryPort.findActiveSprint.mockResolvedValue(
      makeSprintDoc({ status: "ACTIVE", project: projectId }) as never,
    );

    const id = new SprintId(new Types.ObjectId());

    await expect(service.invoke(id)).rejects.toThrow(BadRequestException);

    expect(persistencePort.update).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// CompleteSprintService
// ──────────────────────────────────────────────
describe("CompleteSprintService", () => {
  let service: CompleteSprintService;
  let persistencePort: jest.Mocked<SprintPersistencePort>;
  let queryPort: jest.Mocked<SprintQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompleteSprintService,
        {
          provide: DIToken.SprintModule.SprintPersistencePort,
          useValue: sprintPersistenceMock(),
        },
        {
          provide: DIToken.SprintModule.SprintQueryPort,
          useValue: sprintQueryMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(CompleteSprintService);
    persistencePort = module.get(DIToken.SprintModule.SprintPersistencePort);
    queryPort = module.get(DIToken.SprintModule.SprintQueryPort);
  });

  it("ACTIVE 상태의 스프린트를 정상적으로 완료해야 한다", async () => {
    queryPort.findById.mockResolvedValue(
      makeSprintDoc({ status: "ACTIVE" }) as never,
    );
    persistencePort.update.mockResolvedValue(undefined);

    const id = new SprintId(new Types.ObjectId());
    await service.invoke(id);

    expect(persistencePort.update).toHaveBeenCalledWith(id, {
      status: "COMPLETED",

      completedAt: expect.any(Date),
    });
  });

  it("ACTIVE가 아닌 상태의 스프린트를 완료하면 BadRequestException을 던져야 한다", async () => {
    queryPort.findById.mockResolvedValue(
      makeSprintDoc({ status: "PLANNING" }) as never,
    );

    const id = new SprintId(new Types.ObjectId());

    await expect(service.invoke(id)).rejects.toThrow(BadRequestException);

    expect(persistencePort.update).not.toHaveBeenCalled();
  });
});
