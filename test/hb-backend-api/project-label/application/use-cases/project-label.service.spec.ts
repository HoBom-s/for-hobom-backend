import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";
import { CreateProjectLabelService } from "src/hb-backend-api/project-label/application/use-cases/create-project-label.service";
import { GetProjectLabelsService } from "src/hb-backend-api/project-label/application/use-cases/get-project-labels.service";
import { UpdateProjectLabelService } from "src/hb-backend-api/project-label/application/use-cases/update-project-label.service";
import { DeleteProjectLabelService } from "src/hb-backend-api/project-label/application/use-cases/delete-project-label.service";
import { ProjectLabelPersistencePort } from "src/hb-backend-api/project-label/ports/out/project-label-persistence.port";
import { ProjectLabelQueryPort } from "src/hb-backend-api/project-label/ports/out/project-label-query.port";
import { DIToken } from "src/shared/di/token.di";
import { TransactionRunner } from "src/infra/mongo/transaction/transaction.runner";
import { ProjectLabelId } from "src/hb-backend-api/project-label/domain/model/project-label-id.vo";
import { ProjectId } from "src/hb-backend-api/project/domain/model/project-id.vo";

const makeLabelDoc = (overrides: Record<string, unknown> = {}) => ({
  _id: new Types.ObjectId(),
  project: new Types.ObjectId(),
  name: "Bug",
  color: "#FF0000",
  ...overrides,
});

const labelPersistenceMock = (): Record<string, jest.Mock> => ({
  save: jest.fn(),
  update: jest.fn(),
  deleteOne: jest.fn(),
  deleteByProject: jest.fn(),
});

const labelQueryMock = (): Record<string, jest.Mock> => ({
  findById: jest.fn(),
  findByProject: jest.fn(),
});

// ──────────────────────────────────────────────
// CreateProjectLabelService
// ──────────────────────────────────────────────
describe("CreateProjectLabelService", () => {
  let service: CreateProjectLabelService;
  let persistencePort: jest.Mocked<ProjectLabelPersistencePort>;
  let queryPort: jest.Mocked<ProjectLabelQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProjectLabelService,
        {
          provide: DIToken.ProjectLabelModule.ProjectLabelPersistencePort,
          useValue: labelPersistenceMock(),
        },
        {
          provide: DIToken.ProjectLabelModule.ProjectLabelQueryPort,
          useValue: labelQueryMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(CreateProjectLabelService);
    persistencePort = module.get(
      DIToken.ProjectLabelModule.ProjectLabelPersistencePort,
    );
    queryPort = module.get(DIToken.ProjectLabelModule.ProjectLabelQueryPort);
  });

  it("프로젝트 라벨을 정상적으로 생성해야 한다", async () => {
    queryPort.findByProject.mockResolvedValue([]);
    persistencePort.save.mockResolvedValue(undefined);

    const pid = new ProjectId(new Types.ObjectId());

    await service.invoke(pid, "Feature", "#00FF00");

    expect(queryPort.findByProject).toHaveBeenCalledWith(pid);
    expect(persistencePort.save).toHaveBeenCalledTimes(1);
  });

  it("중복 이름의 라벨이면 BadRequestException을 던져야 한다", async () => {
    queryPort.findByProject.mockResolvedValue([
      makeLabelDoc({ name: "Bug" }) as any,
    ]);

    const pid = new ProjectId(new Types.ObjectId());

    await expect(service.invoke(pid, "Bug", "#FF0000")).rejects.toThrow(
      BadRequestException,
    );

    expect(persistencePort.save).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// GetProjectLabelsService
// ──────────────────────────────────────────────
describe("GetProjectLabelsService", () => {
  let service: GetProjectLabelsService;
  let queryPort: jest.Mocked<ProjectLabelQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProjectLabelsService,
        {
          provide: DIToken.ProjectLabelModule.ProjectLabelQueryPort,
          useValue: labelQueryMock(),
        },
      ],
    }).compile();

    service = module.get(GetProjectLabelsService);
    queryPort = module.get(DIToken.ProjectLabelModule.ProjectLabelQueryPort);
  });

  it("프로젝트별 라벨 배열을 반환해야 한다", async () => {
    queryPort.findByProject.mockResolvedValue([makeLabelDoc() as any]);

    const pid = new ProjectId(new Types.ObjectId());
    const result = await service.invoke(pid);

    expect(result).toHaveLength(1);
    expect(queryPort.findByProject).toHaveBeenCalledWith(pid);
  });

  it("라벨이 없으면 빈 배열을 반환해야 한다", async () => {
    queryPort.findByProject.mockResolvedValue([]);

    const pid = new ProjectId(new Types.ObjectId());
    const result = await service.invoke(pid);

    expect(result).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// UpdateProjectLabelService
// ──────────────────────────────────────────────
describe("UpdateProjectLabelService", () => {
  let service: UpdateProjectLabelService;
  let persistencePort: jest.Mocked<ProjectLabelPersistencePort>;
  let queryPort: jest.Mocked<ProjectLabelQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProjectLabelService,
        {
          provide: DIToken.ProjectLabelModule.ProjectLabelPersistencePort,
          useValue: labelPersistenceMock(),
        },
        {
          provide: DIToken.ProjectLabelModule.ProjectLabelQueryPort,
          useValue: labelQueryMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(UpdateProjectLabelService);
    persistencePort = module.get(
      DIToken.ProjectLabelModule.ProjectLabelPersistencePort,
    );
    queryPort = module.get(DIToken.ProjectLabelModule.ProjectLabelQueryPort);
  });

  it("프로젝트 라벨을 정상적으로 수정해야 한다", async () => {
    queryPort.findById.mockResolvedValue(makeLabelDoc() as any);
    persistencePort.update.mockResolvedValue(undefined);

    const id = new ProjectLabelId(new Types.ObjectId());
    await service.invoke(id, "Updated Label", "#0000FF");

    expect(queryPort.findById).toHaveBeenCalledWith(id);
    expect(persistencePort.update).toHaveBeenCalledWith(id, {
      name: "Updated Label",
      color: "#0000FF",
    });
  });
});

// ──────────────────────────────────────────────
// DeleteProjectLabelService
// ──────────────────────────────────────────────
describe("DeleteProjectLabelService", () => {
  let service: DeleteProjectLabelService;
  let persistencePort: jest.Mocked<ProjectLabelPersistencePort>;
  let queryPort: jest.Mocked<ProjectLabelQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteProjectLabelService,
        {
          provide: DIToken.ProjectLabelModule.ProjectLabelPersistencePort,
          useValue: labelPersistenceMock(),
        },
        {
          provide: DIToken.ProjectLabelModule.ProjectLabelQueryPort,
          useValue: labelQueryMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(DeleteProjectLabelService);
    persistencePort = module.get(
      DIToken.ProjectLabelModule.ProjectLabelPersistencePort,
    );
    queryPort = module.get(DIToken.ProjectLabelModule.ProjectLabelQueryPort);
  });

  it("프로젝트 라벨을 정상적으로 삭제해야 한다", async () => {
    queryPort.findById.mockResolvedValue(makeLabelDoc() as any);
    persistencePort.deleteOne.mockResolvedValue(undefined);

    const id = new ProjectLabelId(new Types.ObjectId());
    await service.invoke(id);

    expect(queryPort.findById).toHaveBeenCalledWith(id);
    expect(persistencePort.deleteOne).toHaveBeenCalledWith(id);
  });
});
