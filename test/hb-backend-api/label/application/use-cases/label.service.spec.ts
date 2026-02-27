import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { BadRequestException } from "@nestjs/common";
import { CreateLabelService } from "../../../../../src/hb-backend-api/label/application/use-cases/create-label.service";
import { DeleteLabelService } from "../../../../../src/hb-backend-api/label/application/use-cases/delete-label.service";
import { GetAllLabelsService } from "../../../../../src/hb-backend-api/label/application/use-cases/get-all-labels.service";
import { GetLabelService } from "../../../../../src/hb-backend-api/label/application/use-cases/get-label.service";
import { PatchLabelService } from "../../../../../src/hb-backend-api/label/application/use-cases/patch-label.service";
import { LabelPersistencePort } from "../../../../../src/hb-backend-api/label/domain/ports/out/label-persistence.port";
import { LabelQueryPort } from "../../../../../src/hb-backend-api/label/domain/ports/out/label-query.port";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { TransactionRunner } from "../../../../../src/infra/mongo/transaction/transaction.runner";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { LabelId } from "../../../../../src/hb-backend-api/label/domain/model/label-id.vo";
import { LabelTitle } from "../../../../../src/hb-backend-api/label/domain/model/label-title.vo";
import { LabelEntitySchema } from "../../../../../src/hb-backend-api/label/domain/model/label.entity";
import { CreateLabelCommand } from "../../../../../src/hb-backend-api/label/domain/ports/out/create-label.command";
import { PatchLabelCommand } from "../../../../../src/hb-backend-api/label/domain/ports/out/patch-label.command";

// ──────────────────────────────────────────────
// Test Factories
// ──────────────────────────────────────────────
const makeOwnerId = () => new UserId(new Types.ObjectId());
const makeLabelId = () => new LabelId(new Types.ObjectId());
const makeTitle = (value = "라벨") => LabelTitle.fromString(value);

const makeLabelEntity = (
  id = makeLabelId(),
  title = makeTitle(),
  owner = makeOwnerId(),
) => LabelEntitySchema.of(id, title, owner);

const mockPersistencePort = (): jest.Mocked<LabelPersistencePort> => ({
  save: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
});

const mockQueryPort = (): jest.Mocked<LabelQueryPort> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByTitle: jest.fn(),
});

// ──────────────────────────────────────────────
// CreateLabelService
// ──────────────────────────────────────────────
describe("CreateLabelService", () => {
  let service: CreateLabelService;
  let persistencePort: jest.Mocked<LabelPersistencePort>;
  let queryPort: jest.Mocked<LabelQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateLabelService,
        {
          provide: DIToken.LabelModule.LabelPersistencePort,
          useValue: mockPersistencePort(),
        },
        {
          provide: DIToken.LabelModule.LabelQueryPort,
          useValue: mockQueryPort(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(CreateLabelService);
    persistencePort = module.get(DIToken.LabelModule.LabelPersistencePort);
    queryPort = module.get(DIToken.LabelModule.LabelQueryPort);
  });

  it("새 라벨을 생성해야 한다", async () => {
    queryPort.findByTitle.mockResolvedValue(null);
    persistencePort.save.mockResolvedValue(undefined);

    const owner = makeOwnerId();
    const title = makeTitle("운동");
    const command = CreateLabelCommand.of(title, owner);

    await service.invoke(command);

    expect(queryPort.findByTitle).toHaveBeenCalledWith(title, owner);
    expect(persistencePort.save).toHaveBeenCalledTimes(1);
  });

  it("동일 제목 라벨이 존재하면 BadRequestException을 던져야 한다", async () => {
    const owner = makeOwnerId();
    const title = makeTitle("운동");
    queryPort.findByTitle.mockResolvedValue(makeLabelEntity());

    const command = CreateLabelCommand.of(title, owner);

    await expect(service.invoke(command)).rejects.toThrow(BadRequestException);
    expect(persistencePort.save).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// DeleteLabelService
// ──────────────────────────────────────────────
describe("DeleteLabelService", () => {
  let service: DeleteLabelService;
  let persistencePort: jest.Mocked<LabelPersistencePort>;
  let queryPort: jest.Mocked<LabelQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteLabelService,
        {
          provide: DIToken.LabelModule.LabelPersistencePort,
          useValue: mockPersistencePort(),
        },
        {
          provide: DIToken.LabelModule.LabelQueryPort,
          useValue: mockQueryPort(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(DeleteLabelService);
    persistencePort = module.get(DIToken.LabelModule.LabelPersistencePort);
    queryPort = module.get(DIToken.LabelModule.LabelQueryPort);
  });

  it("라벨을 조회한 후 삭제해야 한다", async () => {
    const owner = makeOwnerId();
    const entity = makeLabelEntity(makeLabelId(), makeTitle(), owner);
    queryPort.findById.mockResolvedValue(entity);
    persistencePort.deleteOne.mockResolvedValue(undefined);

    await service.invoke(entity.getId, owner);

    expect(queryPort.findById).toHaveBeenCalledWith(entity.getId, owner);
    expect(persistencePort.deleteOne).toHaveBeenCalledWith(entity.getId, owner);
  });
});

// ──────────────────────────────────────────────
// GetAllLabelsService
// ──────────────────────────────────────────────
describe("GetAllLabelsService", () => {
  let service: GetAllLabelsService;
  let queryPort: jest.Mocked<LabelQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllLabelsService,
        {
          provide: DIToken.LabelModule.LabelQueryPort,
          useValue: mockQueryPort(),
        },
      ],
    }).compile();

    service = module.get(GetAllLabelsService);
    queryPort = module.get(DIToken.LabelModule.LabelQueryPort);
  });

  it("라벨 목록을 반환해야 한다", async () => {
    const owner = makeOwnerId();
    queryPort.findAll.mockResolvedValue([makeLabelEntity(), makeLabelEntity()]);

    const result = await service.invoke(owner);

    expect(queryPort.findAll).toHaveBeenCalledWith(owner);
    expect(result).toHaveLength(2);
  });

  it("라벨이 없으면 빈 배열을 반환해야 한다", async () => {
    queryPort.findAll.mockResolvedValue([]);

    const result = await service.invoke(makeOwnerId());

    expect(result).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// GetLabelService
// ──────────────────────────────────────────────
describe("GetLabelService", () => {
  let service: GetLabelService;
  let queryPort: jest.Mocked<LabelQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetLabelService,
        {
          provide: DIToken.LabelModule.LabelQueryPort,
          useValue: mockQueryPort(),
        },
      ],
    }).compile();

    service = module.get(GetLabelService);
    queryPort = module.get(DIToken.LabelModule.LabelQueryPort);
  });

  it("ID로 라벨을 조회해야 한다", async () => {
    const owner = makeOwnerId();
    const entity = makeLabelEntity(makeLabelId(), makeTitle("운동"), owner);
    queryPort.findById.mockResolvedValue(entity);

    const result = await service.invoke(entity.getId, owner);

    expect(queryPort.findById).toHaveBeenCalledWith(entity.getId, owner);
    expect(result.getTitle.raw).toBe("운동");
  });
});

// ──────────────────────────────────────────────
// PatchLabelService
// ──────────────────────────────────────────────
describe("PatchLabelService", () => {
  let service: PatchLabelService;
  let persistencePort: jest.Mocked<LabelPersistencePort>;
  let queryPort: jest.Mocked<LabelQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatchLabelService,
        {
          provide: DIToken.LabelModule.LabelPersistencePort,
          useValue: mockPersistencePort(),
        },
        {
          provide: DIToken.LabelModule.LabelQueryPort,
          useValue: mockQueryPort(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(PatchLabelService);
    persistencePort = module.get(DIToken.LabelModule.LabelPersistencePort);
    queryPort = module.get(DIToken.LabelModule.LabelQueryPort);
  });

  it("라벨을 조회한 후 제목을 수정해야 한다", async () => {
    const owner = makeOwnerId();
    const entity = makeLabelEntity(makeLabelId(), makeTitle("운동"), owner);
    queryPort.findById.mockResolvedValue(entity);
    persistencePort.updateOne.mockResolvedValue(undefined);

    const newTitle = makeTitle("독서");
    const command = PatchLabelCommand.of(newTitle, owner);

    await service.invoke(entity.getId, command);

    expect(queryPort.findById).toHaveBeenCalledWith(entity.getId, owner);
    expect(persistencePort.updateOne).toHaveBeenCalledTimes(1);
    const updateSchema = persistencePort.updateOne.mock.calls[0][1];
    expect(updateSchema.getTitle.raw).toBe("독서");
  });
});
