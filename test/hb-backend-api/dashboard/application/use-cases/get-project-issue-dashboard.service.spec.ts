import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { GetProjectIssueDashboardService } from "src/hb-backend-api/dashboard/application/use-cases/get-project-issue-dashboard.service";
import { IssueEntity } from "src/hb-backend-api/issue/domain/model/issue.entity";
import { ProjectEntity } from "src/hb-backend-api/project/domain/model/project.entity";
import { ProjectId } from "src/hb-backend-api/project/domain/model/project-id.vo";

const makeFindByIdChain = (doc: unknown) => ({
  lean: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(doc),
  }),
});

const makeFacetResult = (overrides: Record<string, unknown> = {}) => ({
  byStatus: [],
  byPriority: [],
  byType: [],
  overview: [],
  ...overrides,
});

describe("GetProjectIssueDashboardService", () => {
  let service: GetProjectIssueDashboardService;
  let issueModel: { aggregate: jest.Mock };
  let projectModel: { findById: jest.Mock };

  const projectId = ProjectId.fromString(new Types.ObjectId().toHexString());

  const projectDoc = {
    _id: projectId.raw,
    workflow: {
      statuses: [
        { id: new Types.ObjectId(), isDone: true },
        { id: new Types.ObjectId(), isDone: false },
      ],
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    issueModel = {
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([makeFacetResult()]),
      }),
    };
    projectModel = {
      findById: jest.fn().mockReturnValue(makeFindByIdChain(projectDoc)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProjectIssueDashboardService,
        { provide: getModelToken(IssueEntity.name), useValue: issueModel },
        { provide: getModelToken(ProjectEntity.name), useValue: projectModel },
      ],
    }).compile();

    service = module.get(GetProjectIssueDashboardService);
  });

  it("프로젝트를 찾을 수 없으면 NotFoundException을 던져야 한다", async () => {
    projectModel.findById.mockReturnValue(makeFindByIdChain(null));

    await expect(service.invoke(projectId)).rejects.toThrow(NotFoundException);
  });

  it("이슈가 없을 때 기본값과 completionRate 0을 반환해야 한다", async () => {
    const result = await service.invoke(projectId);

    expect(result.overview.total).toBe(0);
    expect(result.overview.open).toBe(0);
    expect(result.overview.done).toBe(0);
    expect(result.overview.completionRate).toBe(0);
    expect(result.overview.overdueCount).toBe(0);
    expect(result.byStatus).toEqual([]);
    expect(result.byPriority).toEqual([]);
    expect(result.byType).toEqual([]);
  });

  it("이슈 데이터가 있을 때 completionRate를 계산해야 한다", async () => {
    issueModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        makeFacetResult({
          byStatus: [
            { _id: "TODO", count: 3 },
            { _id: "DONE", count: 7 },
          ],
          byPriority: [{ _id: "HIGH", count: 4 }],
          byType: [{ _id: "BUG", count: 2 }],
          overview: [{ total: 10, done: 7, overdueCount: 1 }],
        }),
      ]),
    });

    const result = await service.invoke(projectId);

    expect(result.overview.total).toBe(10);
    expect(result.overview.open).toBe(3);
    expect(result.overview.done).toBe(7);
    expect(result.overview.completionRate).toBe(7 / 10);
    expect(result.overview.overdueCount).toBe(1);
    expect(result.byStatus).toHaveLength(2);
    expect(result.byStatus[0].statusId).toBe("TODO");
    expect(result.byPriority).toHaveLength(1);
    expect(result.byPriority[0].priority).toBe("HIGH");
    expect(result.byType).toHaveLength(1);
    expect(result.byType[0].type).toBe("BUG");
  });

  it("workflow가 null이면 doneStatusIds가 빈 배열이어야 한다", async () => {
    projectModel.findById.mockReturnValue(
      makeFindByIdChain({ _id: projectId.raw, workflow: null }),
    );

    issueModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        makeFacetResult({
          overview: [{ total: 5, done: 0, overdueCount: 2 }],
        }),
      ]),
    });

    const result = await service.invoke(projectId);

    expect(result.overview.total).toBe(5);
    expect(result.overview.done).toBe(0);
    expect(result.overview.open).toBe(5);
    expect(result.overview.completionRate).toBe(0);
    expect(issueModel.aggregate).toHaveBeenCalledTimes(1);
  });
});
