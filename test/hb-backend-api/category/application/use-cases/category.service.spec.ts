import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";
import { GetAllCategoryService } from "../../../../../src/hb-backend-api/category/application/use-cases/get-all-category.service";
import { GetCategoryService } from "../../../../../src/hb-backend-api/category/application/use-cases/get-category.service";
import { CreateCategoryService } from "../../../../../src/hb-backend-api/category/application/use-cases/create-category.service";
import { PatchCategoryService } from "../../../../../src/hb-backend-api/category/application/use-cases/patch-category.service";
import { DeleteCategoryService } from "../../../../../src/hb-backend-api/category/application/use-cases/delete-category.service";
import { CategoryQueryPort } from "../../../../../src/hb-backend-api/category/domain/ports/out/category-query.port";
import { CategoryPersistencePort } from "../../../../../src/hb-backend-api/category/domain/ports/out/category-persistence.port";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { TransactionRunner } from "../../../../../src/infra/mongo/transaction/transaction.runner";
import { CategoryId } from "../../../../../src/hb-backend-api/category/domain/model/category-id.vo";
import { CategoryTitle } from "../../../../../src/hb-backend-api/category/domain/model/category-title.vo";
import { CategoryEntitySchema } from "../../../../../src/hb-backend-api/category/domain/model/category.entity";
import { CreateCategoryCommand } from "../../../../../src/hb-backend-api/category/domain/ports/out/create-category.command";
import { PatchCategoryCommand } from "../../../../../src/hb-backend-api/category/domain/ports/out/patch-category.command";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";

const makeOwnerId = () => new UserId(new Types.ObjectId());
const makeCategoryId = () => new CategoryId(new Types.ObjectId());
const makeTitle = (t = "운동") => CategoryTitle.fromString(t);

const makeCategorySchema = (
  id = makeCategoryId(),
  title = makeTitle(),
  owner = makeOwnerId(),
) => CategoryEntitySchema.of(id, title, owner, []);

// ──────────────────────────────────────────────
// GetAllCategoryService
// ──────────────────────────────────────────────
describe("GetAllCategoryService", () => {
  let service: GetAllCategoryService;
  let queryPort: jest.Mocked<CategoryQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllCategoryService,
        {
          provide: DIToken.CategoryModule.CategoryQueryPort,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByTitle: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(GetAllCategoryService);
    queryPort = module.get(DIToken.CategoryModule.CategoryQueryPort);
  });

  it("카테고리가 있으면 CategoryQueryResult 배열을 반환해야 한다", async () => {
    const owner = makeOwnerId();
    queryPort.findAll.mockResolvedValue([makeCategorySchema()]);

    const result = await service.invoke(owner);

    expect(result).toHaveLength(1);
    expect(queryPort.findAll).toHaveBeenCalledWith(owner);
  });

  it("카테고리가 없으면 빈 배열을 반환해야 한다", async () => {
    queryPort.findAll.mockResolvedValue([]);
    const result = await service.invoke(makeOwnerId());
    expect(result).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// GetCategoryService
// ──────────────────────────────────────────────
describe("GetCategoryService", () => {
  let service: GetCategoryService;
  let queryPort: jest.Mocked<CategoryQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCategoryService,
        {
          provide: DIToken.CategoryModule.CategoryQueryPort,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByTitle: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(GetCategoryService);
    queryPort = module.get(DIToken.CategoryModule.CategoryQueryPort);
  });

  it("ID로 카테고리를 조회하고 CategoryQueryResult를 반환해야 한다", async () => {
    const id = makeCategoryId();
    const owner = makeOwnerId();
    queryPort.findById.mockResolvedValue(
      makeCategorySchema(id, makeTitle(), owner),
    );

    const result = await service.invoke(id, owner);

    expect(queryPort.findById).toHaveBeenCalledWith(id, owner);
    expect(result).toBeDefined();
  });
});

// ──────────────────────────────────────────────
// CreateCategoryService
// ──────────────────────────────────────────────
describe("CreateCategoryService", () => {
  let service: CreateCategoryService;
  let queryPort: jest.Mocked<CategoryQueryPort>;
  let persistencePort: jest.Mocked<CategoryPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCategoryService,
        {
          provide: DIToken.CategoryModule.CategoryQueryPort,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByTitle: jest.fn(),
          },
        },
        {
          provide: DIToken.CategoryModule.CategoryPersistencePort,
          useValue: {
            save: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(CreateCategoryService);
    queryPort = module.get(DIToken.CategoryModule.CategoryQueryPort);
    persistencePort = module.get(
      DIToken.CategoryModule.CategoryPersistencePort,
    );
  });

  it("중복 없는 카테고리를 정상 생성해야 한다", async () => {
    queryPort.findByTitle.mockResolvedValue(null);
    persistencePort.save.mockResolvedValue(undefined);

    const command = CreateCategoryCommand.of(makeTitle("독서"), makeOwnerId());
    await service.invoke(command);

    expect(persistencePort.save).toHaveBeenCalledTimes(1);
  });

  it("이미 존재하는 카테고리 제목이면 BadRequestException을 던져야 한다", async () => {
    queryPort.findByTitle.mockResolvedValue(makeCategorySchema());

    const command = CreateCategoryCommand.of(makeTitle("운동"), makeOwnerId());
    await expect(service.invoke(command)).rejects.toThrow(BadRequestException);
    expect(persistencePort.save).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// PatchCategoryService
// ──────────────────────────────────────────────
describe("PatchCategoryService", () => {
  let service: PatchCategoryService;
  let queryPort: jest.Mocked<CategoryQueryPort>;
  let persistencePort: jest.Mocked<CategoryPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatchCategoryService,
        {
          provide: DIToken.CategoryModule.CategoryQueryPort,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByTitle: jest.fn(),
          },
        },
        {
          provide: DIToken.CategoryModule.CategoryPersistencePort,
          useValue: {
            save: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(PatchCategoryService);
    queryPort = module.get(DIToken.CategoryModule.CategoryQueryPort);
    persistencePort = module.get(
      DIToken.CategoryModule.CategoryPersistencePort,
    );
  });

  it("카테고리 제목을 정상적으로 수정해야 한다", async () => {
    const id = makeCategoryId();
    const owner = makeOwnerId();
    queryPort.findById.mockResolvedValue(
      makeCategorySchema(id, makeTitle(), owner),
    );
    persistencePort.updateOne.mockResolvedValue(undefined);

    const command = PatchCategoryCommand.of(makeTitle("새제목"), owner);
    await service.invoke(id, command);

    expect(persistencePort.updateOne).toHaveBeenCalledTimes(1);
  });
});

// ──────────────────────────────────────────────
// DeleteCategoryService
// ──────────────────────────────────────────────
describe("DeleteCategoryService", () => {
  let service: DeleteCategoryService;
  let queryPort: jest.Mocked<CategoryQueryPort>;
  let persistencePort: jest.Mocked<CategoryPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCategoryService,
        {
          provide: DIToken.CategoryModule.CategoryQueryPort,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByTitle: jest.fn(),
          },
        },
        {
          provide: DIToken.CategoryModule.CategoryPersistencePort,
          useValue: {
            save: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(DeleteCategoryService);
    queryPort = module.get(DIToken.CategoryModule.CategoryQueryPort);
    persistencePort = module.get(
      DIToken.CategoryModule.CategoryPersistencePort,
    );
  });

  it("카테고리를 조회 후 삭제해야 한다", async () => {
    const id = makeCategoryId();
    const owner = makeOwnerId();
    queryPort.findById.mockResolvedValue(
      makeCategorySchema(id, makeTitle(), owner),
    );
    persistencePort.deleteOne.mockResolvedValue(undefined);

    await service.invoke(id, owner);

    expect(queryPort.findById).toHaveBeenCalledWith(id, owner);
    expect(persistencePort.deleteOne).toHaveBeenCalledTimes(1);
  });
});
