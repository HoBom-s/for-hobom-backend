import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";
import { CreateIssueService } from "src/hb-backend-api/issue/application/use-cases/create-issue.service";
import { GetIssueService } from "src/hb-backend-api/issue/application/use-cases/get-issue.service";
import { GetIssuesByProjectService } from "src/hb-backend-api/issue/application/use-cases/get-issues-by-project.service";
import { DeleteIssueService } from "src/hb-backend-api/issue/application/use-cases/delete-issue.service";
import { TransitionIssueStatusService } from "src/hb-backend-api/issue/application/use-cases/transition-issue-status.service";
import { AssignIssueService } from "src/hb-backend-api/issue/application/use-cases/assign-issue.service";
import { CreateIssueCommentService } from "src/hb-backend-api/issue/application/use-cases/create-issue-comment.service";
import { UpdateIssueCommentService } from "src/hb-backend-api/issue/application/use-cases/update-issue-comment.service";
import { DeleteIssueCommentService } from "src/hb-backend-api/issue/application/use-cases/delete-issue-comment.service";
import { GetIssueCommentsService } from "src/hb-backend-api/issue/application/use-cases/get-issue-comments.service";
import { GetIssueHistoryService } from "src/hb-backend-api/issue/application/use-cases/get-issue-history.service";
import { IssuePersistencePort } from "src/hb-backend-api/issue/ports/out/issue-persistence.port";
import { IssueQueryPort } from "src/hb-backend-api/issue/ports/out/issue-query.port";
import { IssueCommentPersistencePort } from "src/hb-backend-api/issue/ports/out/issue-comment-persistence.port";
import { IssueCommentQueryPort } from "src/hb-backend-api/issue/ports/out/issue-comment-query.port";
import { IssueHistoryPersistencePort } from "src/hb-backend-api/issue/ports/out/issue-history-persistence.port";
import { IssueHistoryQueryPort } from "src/hb-backend-api/issue/ports/out/issue-history-query.port";
import { ProjectQueryPort } from "src/hb-backend-api/project/ports/out/project-query.port";
import { ProjectPersistencePort } from "src/hb-backend-api/project/ports/out/project-persistence.port";
import { DIToken } from "src/shared/di/token.di";
import { TransactionRunner } from "src/infra/mongo/transaction/transaction.runner";
import { IssueId } from "src/hb-backend-api/issue/domain/model/issue-id.vo";
import { IssueCommentId } from "src/hb-backend-api/issue/domain/model/issue-comment-id.vo";
import { ProjectId } from "src/hb-backend-api/project/domain/model/project-id.vo";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { IssueType } from "src/hb-backend-api/issue/domain/enums/issue-type.enum";
import { IssuePriority } from "src/hb-backend-api/issue/domain/enums/issue-priority.enum";

const projectId = new Types.ObjectId();
const reporterId = new Types.ObjectId();

const makeIssueDoc = (overrides: Record<string, unknown> = {}) => ({
  _id: new Types.ObjectId(),
  project: projectId,
  issueNumber: 1,
  issueKey: "HB-1",
  type: "TASK",
  title: "Test",
  description: null,
  status: "todo",
  statusCategory: "TODO",
  priority: "MEDIUM",
  resolution: null,
  reporter: reporterId,
  assignee: null,
  sprint: null,
  parent: null,
  labels: [],
  storyPoints: null,
  boardOrder: 0,
  backlogOrder: 0,
  dueDate: null,
  startDate: null,
  resolvedAt: null,
  archivedAt: null,
  ...overrides,
});

const makeProjectDoc = (overrides: Record<string, unknown> = {}) => ({
  _id: projectId,
  key: "HB",
  name: "Test",
  owner: new Types.ObjectId(),
  members: [],
  issueSequence: 0,
  workflow: {
    statuses: [
      { id: "todo", name: "To Do", category: "TODO", order: 0 },
      {
        id: "inprogress",
        name: "In Progress",
        category: "IN_PROGRESS",
        order: 1,
      },
      { id: "done", name: "Done", category: "DONE", order: 2 },
    ],
    transitions: [
      { from: "todo", to: "inprogress", name: "Start" },
      { from: "inprogress", to: "done", name: "Finish" },
    ],
  },
  issueTypes: [],
  priorities: [],
  ...overrides,
});

const issueQueryMock = (): Record<string, jest.Mock> => ({
  findById: jest.fn(),
  findByIssueKey: jest.fn(),
  findByProject: jest.fn(),
  findBySprint: jest.fn(),
  findByAssignee: jest.fn(),
  findByParent: jest.fn(),
});

const issuePersistenceMock = (): Record<string, jest.Mock> => ({
  save: jest.fn(),
  update: jest.fn(),
  deleteOne: jest.fn(),
  deleteByProject: jest.fn(),
});

const issueCommentPersistenceMock = (): Record<string, jest.Mock> => ({
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  deleteByProject: jest.fn(),
});

const issueCommentQueryMock = (): Record<string, jest.Mock> => ({
  findByIssue: jest.fn(),
  findById: jest.fn(),
});

const issueHistoryPersistenceMock = (): Record<string, jest.Mock> => ({
  save: jest.fn(),
  deleteByProject: jest.fn(),
});

const issueHistoryQueryMock = (): Record<string, jest.Mock> => ({
  findByIssue: jest.fn(),
  findByProject: jest.fn(),
});

const projectQueryMock = (): Record<string, jest.Mock> => ({
  findById: jest.fn(),
  findByKey: jest.fn(),
  findByOwner: jest.fn(),
  findByMember: jest.fn(),
});

const projectPersistenceMock = (): Record<string, jest.Mock> => ({
  save: jest.fn(),
  update: jest.fn(),
  incrementIssueSequence: jest.fn(),
  addMember: jest.fn(),
  removeMember: jest.fn(),
  deleteOne: jest.fn(),
});

// ──────────────────────────────────────────────
// CreateIssueService
// ──────────────────────────────────────────────
describe("CreateIssueService", () => {
  let service: CreateIssueService;
  let issuePersistence: jest.Mocked<IssuePersistencePort>;
  let projectQuery: jest.Mocked<ProjectQueryPort>;
  let projectPersistence: jest.Mocked<ProjectPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateIssueService,
        {
          provide: DIToken.IssueModule.IssuePersistencePort,
          useValue: issuePersistenceMock(),
        },
        {
          provide: DIToken.ProjectModule.ProjectQueryPort,
          useValue: projectQueryMock(),
        },
        {
          provide: DIToken.ProjectModule.ProjectPersistencePort,
          useValue: projectPersistenceMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(CreateIssueService);
    issuePersistence = module.get(DIToken.IssueModule.IssuePersistencePort);
    projectQuery = module.get(DIToken.ProjectModule.ProjectQueryPort);
    projectPersistence = module.get(
      DIToken.ProjectModule.ProjectPersistencePort,
    );
  });

  it("이슈를 정상적으로 생성해야 한다 (issueKey 생성 포함)", async () => {
    projectQuery.findById.mockResolvedValue(makeProjectDoc() as never);
    projectPersistence.incrementIssueSequence.mockResolvedValue(1);
    issuePersistence.save.mockResolvedValue(undefined);

    const pid = new ProjectId(projectId);
    const reporter = new UserId(reporterId);

    await service.invoke(
      pid,
      IssueType.TASK,
      "Test Issue",
      null,
      IssuePriority.MEDIUM,
      reporter,
      null,
      null,
      null,
      [],
    );

    expect(projectQuery.findById).toHaveBeenCalledWith(pid);
    expect(projectPersistence.incrementIssueSequence).toHaveBeenCalledWith(pid);
    expect(issuePersistence.save).toHaveBeenCalledTimes(1);

    const savedEntity = issuePersistence.save.mock.calls[0][0];
    expect(savedEntity.getIssueKey).toBe("HB-1");
  });
});

// ──────────────────────────────────────────────
// GetIssueService
// ──────────────────────────────────────────────
describe("GetIssueService", () => {
  let service: GetIssueService;
  let queryPort: jest.Mocked<IssueQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetIssueService,
        {
          provide: DIToken.IssueModule.IssueQueryPort,
          useValue: issueQueryMock(),
        },
      ],
    }).compile();

    service = module.get(GetIssueService);
    queryPort = module.get(DIToken.IssueModule.IssueQueryPort);
  });

  it("ID로 이슈를 정상적으로 조회해야 한다", async () => {
    const doc = makeIssueDoc();
    queryPort.findById.mockResolvedValue(doc as never);

    const id = new IssueId(new Types.ObjectId());
    const result = await service.invoke(id);

    expect(queryPort.findById).toHaveBeenCalledWith(id);
    expect(result).toBeDefined();
  });
});

// ──────────────────────────────────────────────
// GetIssuesByProjectService
// ──────────────────────────────────────────────
describe("GetIssuesByProjectService", () => {
  let service: GetIssuesByProjectService;
  let queryPort: jest.Mocked<IssueQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetIssuesByProjectService,
        {
          provide: DIToken.IssueModule.IssueQueryPort,
          useValue: issueQueryMock(),
        },
      ],
    }).compile();

    service = module.get(GetIssuesByProjectService);
    queryPort = module.get(DIToken.IssueModule.IssueQueryPort);
  });

  it("프로젝트별 이슈 배열을 반환해야 한다", async () => {
    queryPort.findByProject.mockResolvedValue([makeIssueDoc() as never]);

    const pid = new ProjectId(new Types.ObjectId());
    const result = await service.invoke(pid);

    expect(result).toHaveLength(1);
    expect(queryPort.findByProject).toHaveBeenCalledWith(pid);
  });
});

// ──────────────────────────────────────────────
// DeleteIssueService
// ──────────────────────────────────────────────
describe("DeleteIssueService", () => {
  let service: DeleteIssueService;
  let issuePersistence: jest.Mocked<IssuePersistencePort>;
  let issueQuery: jest.Mocked<IssueQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteIssueService,
        {
          provide: DIToken.IssueModule.IssuePersistencePort,
          useValue: issuePersistenceMock(),
        },
        {
          provide: DIToken.IssueModule.IssueQueryPort,
          useValue: issueQueryMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(DeleteIssueService);
    issuePersistence = module.get(DIToken.IssueModule.IssuePersistencePort);
    issueQuery = module.get(DIToken.IssueModule.IssueQueryPort);
  });

  it("하위 이슈가 없으면 정상적으로 삭제해야 한다", async () => {
    issueQuery.findByParent.mockResolvedValue([]);
    issuePersistence.deleteOne.mockResolvedValue(undefined);

    const id = new IssueId(new Types.ObjectId());
    await service.invoke(id);

    expect(issueQuery.findByParent).toHaveBeenCalledWith(id);
    expect(issuePersistence.deleteOne).toHaveBeenCalledWith(id);
  });

  it("하위 이슈가 존재하면 BadRequestException을 던져야 한다", async () => {
    issueQuery.findByParent.mockResolvedValue([makeIssueDoc() as never]);

    const id = new IssueId(new Types.ObjectId());

    await expect(service.invoke(id)).rejects.toThrow(BadRequestException);

    expect(issuePersistence.deleteOne).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// TransitionIssueStatusService
// ──────────────────────────────────────────────
describe("TransitionIssueStatusService", () => {
  let service: TransitionIssueStatusService;
  let issuePersistence: jest.Mocked<IssuePersistencePort>;
  let issueQuery: jest.Mocked<IssueQueryPort>;
  let issueHistoryPersistence: jest.Mocked<IssueHistoryPersistencePort>;
  let projectQuery: jest.Mocked<ProjectQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransitionIssueStatusService,
        {
          provide: DIToken.IssueModule.IssuePersistencePort,
          useValue: issuePersistenceMock(),
        },
        {
          provide: DIToken.IssueModule.IssueQueryPort,
          useValue: issueQueryMock(),
        },
        {
          provide: DIToken.IssueModule.IssueHistoryPersistencePort,
          useValue: issueHistoryPersistenceMock(),
        },
        {
          provide: DIToken.ProjectModule.ProjectQueryPort,
          useValue: projectQueryMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(TransitionIssueStatusService);
    issuePersistence = module.get(DIToken.IssueModule.IssuePersistencePort);
    issueQuery = module.get(DIToken.IssueModule.IssueQueryPort);
    issueHistoryPersistence = module.get(
      DIToken.IssueModule.IssueHistoryPersistencePort,
    );
    projectQuery = module.get(DIToken.ProjectModule.ProjectQueryPort);
  });

  it("유효한 전환을 정상적으로 수행해야 한다", async () => {
    issueQuery.findById.mockResolvedValue(
      makeIssueDoc({ status: "todo", project: projectId }) as never,
    );
    projectQuery.findById.mockResolvedValue(makeProjectDoc() as never);
    issuePersistence.update.mockResolvedValue(undefined);
    issueHistoryPersistence.save.mockResolvedValue(undefined);

    const id = new IssueId(new Types.ObjectId());
    const actor = new UserId(new Types.ObjectId());

    await service.invoke(id, "inprogress", actor);

    expect(issuePersistence.update).toHaveBeenCalledWith(id, {
      status: "inprogress",
      statusCategory: "IN_PROGRESS",
    });
    expect(issueHistoryPersistence.save).toHaveBeenCalledTimes(1);
  });

  it("워크플로우가 없으면 BadRequestException을 던져야 한다", async () => {
    issueQuery.findById.mockResolvedValue(
      makeIssueDoc({ project: projectId }) as never,
    );
    projectQuery.findById.mockResolvedValue(
      makeProjectDoc({ workflow: null }) as never,
    );

    const id = new IssueId(new Types.ObjectId());
    const actor = new UserId(new Types.ObjectId());

    await expect(service.invoke(id, "inprogress", actor)).rejects.toThrow(
      BadRequestException,
    );

    expect(issuePersistence.update).not.toHaveBeenCalled();
  });

  it("유효하지 않은 전환이면 BadRequestException을 던져야 한다", async () => {
    issueQuery.findById.mockResolvedValue(
      makeIssueDoc({ status: "todo", project: projectId }) as never,
    );
    projectQuery.findById.mockResolvedValue(makeProjectDoc() as never);

    const id = new IssueId(new Types.ObjectId());
    const actor = new UserId(new Types.ObjectId());

    await expect(service.invoke(id, "done", actor)).rejects.toThrow(
      BadRequestException,
    );

    expect(issuePersistence.update).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// AssignIssueService
// ──────────────────────────────────────────────
describe("AssignIssueService", () => {
  let service: AssignIssueService;
  let issuePersistence: jest.Mocked<IssuePersistencePort>;
  let issueQuery: jest.Mocked<IssueQueryPort>;
  let issueHistoryPersistence: jest.Mocked<IssueHistoryPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignIssueService,
        {
          provide: DIToken.IssueModule.IssuePersistencePort,
          useValue: issuePersistenceMock(),
        },
        {
          provide: DIToken.IssueModule.IssueQueryPort,
          useValue: issueQueryMock(),
        },
        {
          provide: DIToken.IssueModule.IssueHistoryPersistencePort,
          useValue: issueHistoryPersistenceMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(AssignIssueService);
    issuePersistence = module.get(DIToken.IssueModule.IssuePersistencePort);
    issueQuery = module.get(DIToken.IssueModule.IssueQueryPort);
    issueHistoryPersistence = module.get(
      DIToken.IssueModule.IssueHistoryPersistencePort,
    );
  });

  it("담당자를 정상적으로 변경해야 한다", async () => {
    issueQuery.findById.mockResolvedValue(
      makeIssueDoc({ project: projectId }) as never,
    );
    issuePersistence.update.mockResolvedValue(undefined);
    issueHistoryPersistence.save.mockResolvedValue(undefined);

    const id = new IssueId(new Types.ObjectId());
    const assignee = new UserId(new Types.ObjectId());
    const actor = new UserId(new Types.ObjectId());

    await service.invoke(id, assignee, actor);

    expect(issuePersistence.update).toHaveBeenCalledTimes(1);
    expect(issueHistoryPersistence.save).toHaveBeenCalledTimes(1);
  });
});

// ──────────────────────────────────────────────
// CreateIssueCommentService
// ──────────────────────────────────────────────
describe("CreateIssueCommentService", () => {
  let service: CreateIssueCommentService;
  let commentPersistence: jest.Mocked<IssueCommentPersistencePort>;
  let historyPersistence: jest.Mocked<IssueHistoryPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateIssueCommentService,
        {
          provide: DIToken.IssueModule.IssueCommentPersistencePort,
          useValue: issueCommentPersistenceMock(),
        },
        {
          provide: DIToken.IssueModule.IssueHistoryPersistencePort,
          useValue: issueHistoryPersistenceMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(CreateIssueCommentService);
    commentPersistence = module.get(
      DIToken.IssueModule.IssueCommentPersistencePort,
    );
    historyPersistence = module.get(
      DIToken.IssueModule.IssueHistoryPersistencePort,
    );
  });

  it("댓글을 정상적으로 생성해야 한다", async () => {
    commentPersistence.save.mockResolvedValue(undefined);
    historyPersistence.save.mockResolvedValue(undefined);

    const issueId = new IssueId(new Types.ObjectId());
    const pid = new ProjectId(new Types.ObjectId());
    const author = new UserId(new Types.ObjectId());

    await service.invoke(issueId, pid, author, "Test comment");

    expect(commentPersistence.save).toHaveBeenCalledTimes(1);
    expect(historyPersistence.save).toHaveBeenCalledTimes(1);
  });
});

// ──────────────────────────────────────────────
// UpdateIssueCommentService
// ──────────────────────────────────────────────
describe("UpdateIssueCommentService", () => {
  let service: UpdateIssueCommentService;
  let commentPersistence: jest.Mocked<IssueCommentPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateIssueCommentService,
        {
          provide: DIToken.IssueModule.IssueCommentPersistencePort,
          useValue: issueCommentPersistenceMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(UpdateIssueCommentService);
    commentPersistence = module.get(
      DIToken.IssueModule.IssueCommentPersistencePort,
    );
  });

  it("댓글을 정상적으로 수정해야 한다", async () => {
    commentPersistence.update.mockResolvedValue(undefined);

    const id = new IssueCommentId(new Types.ObjectId());
    await service.invoke(id, "Updated comment");

    expect(commentPersistence.update).toHaveBeenCalledWith(id, {
      body: "Updated comment",
    });
  });
});

// ──────────────────────────────────────────────
// DeleteIssueCommentService
// ──────────────────────────────────────────────
describe("DeleteIssueCommentService", () => {
  let service: DeleteIssueCommentService;
  let commentPersistence: jest.Mocked<IssueCommentPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteIssueCommentService,
        {
          provide: DIToken.IssueModule.IssueCommentPersistencePort,
          useValue: issueCommentPersistenceMock(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(DeleteIssueCommentService);
    commentPersistence = module.get(
      DIToken.IssueModule.IssueCommentPersistencePort,
    );
  });

  it("댓글을 정상적으로 삭제해야 한다", async () => {
    commentPersistence.softDelete.mockResolvedValue(undefined);

    const id = new IssueCommentId(new Types.ObjectId());
    await service.invoke(id);

    expect(commentPersistence.softDelete).toHaveBeenCalledWith(id);
  });
});

// ──────────────────────────────────────────────
// GetIssueCommentsService
// ──────────────────────────────────────────────
describe("GetIssueCommentsService", () => {
  let service: GetIssueCommentsService;
  let commentQuery: jest.Mocked<IssueCommentQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetIssueCommentsService,
        {
          provide: DIToken.IssueModule.IssueCommentQueryPort,
          useValue: issueCommentQueryMock(),
        },
      ],
    }).compile();

    service = module.get(GetIssueCommentsService);
    commentQuery = module.get(DIToken.IssueModule.IssueCommentQueryPort);
  });

  it("이슈별 댓글 목록을 정상적으로 조회해야 한다", async () => {
    commentQuery.findByIssue.mockResolvedValue([]);

    const issueId = new IssueId(new Types.ObjectId());
    const result = await service.invoke(issueId);

    expect(commentQuery.findByIssue).toHaveBeenCalledWith(issueId);
    expect(result).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// GetIssueHistoryService
// ──────────────────────────────────────────────
describe("GetIssueHistoryService", () => {
  let service: GetIssueHistoryService;
  let historyQuery: jest.Mocked<IssueHistoryQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetIssueHistoryService,
        {
          provide: DIToken.IssueModule.IssueHistoryQueryPort,
          useValue: issueHistoryQueryMock(),
        },
      ],
    }).compile();

    service = module.get(GetIssueHistoryService);
    historyQuery = module.get(DIToken.IssueModule.IssueHistoryQueryPort);
  });

  it("이슈별 히스토리를 정상적으로 조회해야 한다", async () => {
    historyQuery.findByIssue.mockResolvedValue([]);

    const issueId = new IssueId(new Types.ObjectId());
    const result = await service.invoke(issueId);

    expect(historyQuery.findByIssue).toHaveBeenCalledWith(issueId);
    expect(result).toEqual([]);
  });
});
