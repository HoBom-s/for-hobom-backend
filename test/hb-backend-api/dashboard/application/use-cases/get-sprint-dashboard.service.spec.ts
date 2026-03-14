import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { GetSprintDashboardService } from "src/hb-backend-api/dashboard/application/use-cases/get-sprint-dashboard.service";
import { IssueEntity } from "src/hb-backend-api/issue/domain/model/issue.entity";
import { SprintEntity } from "src/hb-backend-api/sprint/domain/model/sprint.entity";
import { ProjectEntity } from "src/hb-backend-api/project/domain/model/project.entity";
import { ProjectId } from "src/hb-backend-api/project/domain/model/project-id.vo";

const makeFindByIdChain = (doc: unknown) => ({
  lean: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(doc),
  }),
});

describe("GetSprintDashboardService", () => {
  let service: GetSprintDashboardService;
  let issueModel: { aggregate: jest.Mock };
  let sprintModel: { findById: jest.Mock };
  let projectModel: { findById: jest.Mock };

  const projectId = ProjectId.fromString(new Types.ObjectId().toHexString());
  const sprintId = new Types.ObjectId();

  const sprintDoc = {
    _id: sprintId,
    name: "Sprint 1",
    goal: "Complete features",
    status: "ACTIVE",
    startDate: new Date("2026-03-01"),
    endDate: new Date("2026-03-14"),
  };

  const doneStatusId = new Types.ObjectId();

  const projectDoc = {
    _id: projectId.raw,
    workflow: {
      statuses: [
        { id: doneStatusId, isDone: true },
        { id: new Types.ObjectId(), isDone: false },
      ],
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    issueModel = {
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    };
    sprintModel = {
      findById: jest.fn().mockReturnValue(makeFindByIdChain(sprintDoc)),
    };
    projectModel = {
      findById: jest.fn().mockReturnValue(makeFindByIdChain(projectDoc)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSprintDashboardService,
        { provide: getModelToken(IssueEntity.name), useValue: issueModel },
        { provide: getModelToken(SprintEntity.name), useValue: sprintModel },
        { provide: getModelToken(ProjectEntity.name), useValue: projectModel },
      ],
    }).compile();

    service = module.get(GetSprintDashboardService);
  });

  it("스프린트를 찾을 수 없으면 NotFoundException을 던져야 한다", async () => {
    sprintModel.findById.mockReturnValue(makeFindByIdChain(null));

    await expect(service.invoke(projectId, sprintId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("프로젝트를 찾을 수 없으면 NotFoundException을 던져야 한다", async () => {
    projectModel.findById.mockReturnValue(makeFindByIdChain(null));

    await expect(service.invoke(projectId, sprintId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("이슈가 없을 때 기본 stats와 completionRate 0을 반환해야 한다", async () => {
    const result = await service.invoke(projectId, sprintId);

    expect(result.sprint.id).toBe(sprintId.toString());
    expect(result.sprint.name).toBe("Sprint 1");
    expect(result.overview.totalIssues).toBe(0);
    expect(result.overview.completedIssues).toBe(0);
    expect(result.overview.completionRate).toBe(0);
    expect(result.overview.totalStoryPoints).toBe(0);
    expect(result.overview.completedStoryPoints).toBe(0);
  });

  it("이슈 데이터가 있을 때 completionRate를 계산해야 한다", async () => {
    issueModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          totalIssues: 10,
          completedIssues: 4,
          totalStoryPoints: 30,
          completedStoryPoints: 12,
        },
      ]),
    });

    const result = await service.invoke(projectId, sprintId);

    expect(result.overview.totalIssues).toBe(10);
    expect(result.overview.completedIssues).toBe(4);
    expect(result.overview.completionRate).toBe(4 / 10);
    expect(result.overview.totalStoryPoints).toBe(30);
    expect(result.overview.completedStoryPoints).toBe(12);
  });

  it("workflow가 null이면 doneStatusIds가 빈 배열이어야 한다", async () => {
    projectModel.findById.mockReturnValue(
      makeFindByIdChain({ _id: projectId.raw, workflow: null }),
    );

    issueModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          totalIssues: 5,
          completedIssues: 0,
          totalStoryPoints: 10,
          completedStoryPoints: 0,
        },
      ]),
    });

    const result = await service.invoke(projectId, sprintId);

    expect(result.overview.totalIssues).toBe(5);
    expect(result.overview.completedIssues).toBe(0);
    expect(issueModel.aggregate).toHaveBeenCalledTimes(1);
  });
});
