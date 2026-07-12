import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { GetNoteDashboardService } from "src/hb-backend-api/dashboard/application/use-cases/get-note-dashboard.service";
import { NoteEntity } from "src/hb-backend-api/note/domain/model/note.entity";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";

const makeFacetResult = (overrides: Record<string, unknown> = {}) => ({
  byStatus: [],
  byType: [],
  byLabel: [],
  checklistStats: [],
  dailyCreated: [],
  overview: [],
  ...overrides,
});

describe("GetNoteDashboardService", () => {
  let service: GetNoteDashboardService;
  let noteModel: { aggregate: jest.Mock };

  const owner = UserId.fromString(new Types.ObjectId().toHexString());

  beforeEach(async () => {
    jest.clearAllMocks();

    noteModel = {
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([makeFacetResult()]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetNoteDashboardService,
        { provide: getModelToken(NoteEntity.name), useValue: noteModel },
      ],
    }).compile();

    service = module.get(GetNoteDashboardService);
  });

  it("데이터가 없을 때 기본값으로 대시보드를 반환해야 한다", async () => {
    const result = await service.invoke(owner);

    expect(result.overview.total).toBe(0);
    expect(result.overview.checklistCompletionRate).toBe(0);
    expect(result.byStatus).toEqual([]);
    expect(result.byType).toEqual([]);
    expect(result.byLabel).toEqual([]);
    expect(result.dailyCreated).toEqual([]);
  });

  it("체크리스트 데이터가 있을 때 completionRate를 계산해야 한다", async () => {
    const labelId = new Types.ObjectId();
    noteModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        makeFacetResult({
          byStatus: [{ _id: "ACTIVE", count: 5 }],
          byType: [{ _id: "CHECKLIST", count: 3 }],
          byLabel: [{ _id: labelId, count: 2 }],
          checklistStats: [{ total: 20, checked: 15 }],
          dailyCreated: [{ _id: "2026-03-14", count: 4 }],
          overview: [{ total: 8 }],
        }),
      ]),
    });

    const result = await service.invoke(owner);

    expect(result.overview.total).toBe(8);
    expect(result.overview.checklistCompletionRate).toBe(15 / 20);
    expect(result.byStatus).toHaveLength(1);
    expect(result.byStatus[0].status).toBe("ACTIVE");
    expect(result.byType).toHaveLength(1);
    expect(result.byType[0].type).toBe("CHECKLIST");
    expect(result.byLabel).toHaveLength(1);
    expect(result.byLabel[0].labelId).toBe(labelId.toString());
    expect(result.dailyCreated).toHaveLength(1);
    expect(result.dailyCreated[0].date).toBe("2026-03-14");
  });

  it("체크리스트 total이 0이면 completionRate가 0이어야 한다", async () => {
    noteModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        makeFacetResult({
          checklistStats: [{ total: 0, checked: 0 }],
          overview: [{ total: 3 }],
        }),
      ]),
    });

    const result = await service.invoke(owner);

    expect(result.overview.total).toBe(3);
    expect(result.overview.checklistCompletionRate).toBe(0);
  });
});
