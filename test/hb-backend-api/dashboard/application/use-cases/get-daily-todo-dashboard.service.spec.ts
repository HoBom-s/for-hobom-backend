import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { GetDailyTodoDashboardService } from "src/hb-backend-api/dashboard/application/use-cases/get-daily-todo-dashboard.service";
import { DailyTodoEntity } from "src/hb-backend-api/daily-todo/domain/entity/daily-todo.entity";
import { CategoryEntity } from "src/hb-backend-api/category/domain/model/category.entity";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { DashboardPeriod } from "src/hb-backend-api/dashboard/domain/enums/dashboard-period.enum";

const catId = new Types.ObjectId();

const makeFacetResult = (overrides: Record<string, unknown> = {}) => ({
  daily: [],
  byCategory: [],
  byCycle: [],
  overview: [],
  ...overrides,
});

const makeCategoryFindChain = (docs: unknown[] = []) => ({
  find: jest.fn().mockReturnValue({
    lean: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(docs),
    }),
  }),
});

describe("GetDailyTodoDashboardService", () => {
  let service: GetDailyTodoDashboardService;
  let dailyTodoModel: { aggregate: jest.Mock };
  let categoryModel: ReturnType<typeof makeCategoryFindChain>;

  beforeEach(async () => {
    dailyTodoModel = {
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([makeFacetResult()]),
      }),
    };
    categoryModel = makeCategoryFindChain();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDailyTodoDashboardService,
        {
          provide: getModelToken(DailyTodoEntity.name),
          useValue: dailyTodoModel,
        },
        {
          provide: getModelToken(CategoryEntity.name),
          useValue: categoryModel,
        },
      ],
    }).compile();

    service = module.get(GetDailyTodoDashboardService);
  });

  it("데이터가 없을 때 기본값으로 대시보드를 반환해야 한다", async () => {
    const owner = new UserId(new Types.ObjectId());
    const date = new Date("2026-03-14");

    const result = await service.invoke(owner, DashboardPeriod.WEEKLY, date);

    expect(result.period).toBe(DashboardPeriod.WEEKLY);
    expect(result.overview.total).toBe(0);
    expect(result.overview.completed).toBe(0);
    expect(result.overview.completionRate).toBe(0);
    expect(result.daily).toEqual([]);
    expect(result.byCategory).toEqual([]);
    expect(result.byCycle).toEqual([]);
  });

  it("facet 데이터가 있을 때 대시보드 결과를 정상적으로 매핑해야 한다", async () => {
    dailyTodoModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        makeFacetResult({
          daily: [{ _id: "2026-03-14", total: 5, completed: 3 }],
          byCategory: [{ _id: catId, total: 5, completed: 3 }],
          byCycle: [{ _id: "EVERYDAY", total: 5, completed: 3 }],
          overview: [{ total: 5, completed: 3, reactionsCount: 1 }],
        }),
      ]),
    });
    categoryModel.find.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ _id: catId, title: "운동" }]),
      }),
    });

    const owner = new UserId(new Types.ObjectId());
    const result = await service.invoke(
      owner,
      DashboardPeriod.WEEKLY,
      new Date("2026-03-14"),
    );

    expect(result.overview.total).toBe(5);
    expect(result.overview.completed).toBe(3);
    expect(result.overview.completionRate).toBe(3 / 5);
    expect(result.overview.reactionsCount).toBe(1);
    expect(result.daily).toHaveLength(1);
    expect(result.daily[0].completionRate).toBe(3 / 5);
    expect(result.byCategory).toHaveLength(1);
    expect(result.byCategory[0].categoryTitle).toBe("운동");
    expect(result.byCycle).toHaveLength(1);
    expect(result.byCycle[0].cycle).toBe("EVERYDAY");
  });

  it("카테고리 이름을 찾을 수 없으면 Unknown으로 표시해야 한다", async () => {
    const unknownCatId = new Types.ObjectId();
    dailyTodoModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        makeFacetResult({
          byCategory: [{ _id: unknownCatId, total: 2, completed: 1 }],
          overview: [{ total: 2, completed: 1, reactionsCount: 0 }],
        }),
      ]),
    });
    categoryModel.find.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    });

    const result = await service.invoke(
      new UserId(new Types.ObjectId()),
      DashboardPeriod.WEEKLY,
      new Date("2026-03-14"),
    );

    expect(result.byCategory[0].categoryTitle).toBe("Unknown");
  });

  it("에러가 발생하면 전파되어야 한다", async () => {
    dailyTodoModel.aggregate.mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error("aggregate failed")),
    });

    await expect(
      service.invoke(
        new UserId(new Types.ObjectId()),
        DashboardPeriod.WEEKLY,
        new Date(),
      ),
    ).rejects.toThrow("aggregate failed");
  });
});
