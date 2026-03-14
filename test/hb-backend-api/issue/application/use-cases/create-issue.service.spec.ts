import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";
import { CreateIssueService } from "src/hb-backend-api/issue/application/use-cases/create-issue.service";
import { DIToken } from "src/shared/di/token.di";
import { TransactionRunner } from "src/infra/mongo/transaction/transaction.runner";
import { ProjectId } from "src/hb-backend-api/project/domain/model/project-id.vo";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { IssueType } from "src/hb-backend-api/issue/domain/enums/issue-type.enum";
import { IssuePriority } from "src/hb-backend-api/issue/domain/enums/issue-priority.enum";

const projectId = ProjectId.fromString(new Types.ObjectId().toHexString());
const reporter = UserId.fromString(new Types.ObjectId().toHexString());

const makeProject = (overrides: Record<string, unknown> = {}) => ({
  _id: projectId.raw,
  key: "HB",
  workflow: {
    statuses: [
      { id: "todo", name: "To Do", isDone: false },
      { id: "done", name: "Done", isDone: true },
    ],
  },
  ...overrides,
});

describe("CreateIssueService", () => {
  let service: CreateIssueService;
  const mockSave = jest.fn();
  const mockFindById = jest.fn();
  const mockIncrementIssueSequence = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    mockFindById.mockResolvedValue(makeProject());
    mockIncrementIssueSequence.mockResolvedValue(1);
    mockSave.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateIssueService,
        {
          provide: DIToken.IssueModule.IssuePersistencePort,
          useValue: { save: mockSave },
        },
        {
          provide: DIToken.ProjectModule.ProjectQueryPort,
          useValue: { findById: mockFindById },
        },
        {
          provide: DIToken.ProjectModule.ProjectPersistencePort,
          useValue: { incrementIssueSequence: mockIncrementIssueSequence },
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb: () => unknown) => cb()) },
        },
      ],
    }).compile();

    service = module.get(CreateIssueService);
  });

  it("정상적으로 이슈를 생성해야 한다", async () => {
    await service.invoke(
      projectId,
      IssueType.TASK,
      "테스트",
      null,
      IssuePriority.MEDIUM,
      reporter,
      null,
      null,
      null,
      [],
    );

    expect(mockIncrementIssueSequence).toHaveBeenCalledWith(projectId);
    expect(mockSave).toHaveBeenCalled();
  });

  it("workflow가 null이면 BadRequestException을 던져야 한다", async () => {
    mockFindById.mockResolvedValue(makeProject({ workflow: null }));

    await expect(
      service.invoke(
        projectId,
        IssueType.TASK,
        "테스트",
        null,
        IssuePriority.MEDIUM,
        reporter,
        null,
        null,
        null,
        [],
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("workflow statuses가 비어있으면 BadRequestException을 던져야 한다", async () => {
    mockFindById.mockResolvedValue(makeProject({ workflow: { statuses: [] } }));

    await expect(
      service.invoke(
        projectId,
        IssueType.TASK,
        "테스트",
        null,
        IssuePriority.MEDIUM,
        reporter,
        null,
        null,
        null,
        [],
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
