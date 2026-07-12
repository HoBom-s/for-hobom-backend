import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { UpdateIssueService } from "src/hb-backend-api/issue/application/use-cases/update-issue.service";
import { IssuePersistencePort } from "src/hb-backend-api/issue/ports/out/issue-persistence.port";
import { IssueQueryPort } from "src/hb-backend-api/issue/ports/out/issue-query.port";
import { IssueHistoryPersistencePort } from "src/hb-backend-api/issue/ports/out/issue-history-persistence.port";
import { DIToken } from "src/shared/di/token.di";
import { TransactionRunner } from "src/infra/mongo/transaction/transaction.runner";
import { IssueId } from "src/hb-backend-api/issue/domain/model/issue-id.vo";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";

const projectId = new Types.ObjectId();

const makeIssueDoc = (overrides: Record<string, unknown> = {}) => ({
  _id: new Types.ObjectId(),
  project: projectId,
  issueNumber: 1,
  issueKey: "HB-1",
  type: "TASK",
  title: "Test",
  description: null,
  status: "todo",
  priority: "MEDIUM",
  resolution: null,
  reporter: new Types.ObjectId(),
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

const issuePersistenceMock = (): Record<string, jest.Mock> => ({
  save: jest.fn(),
  update: jest.fn(),
  deleteOne: jest.fn(),
  deleteByProject: jest.fn(),
});

const issueQueryMock = (): Record<string, jest.Mock> => ({
  findById: jest.fn(),
  findByIssueKey: jest.fn(),
  findByProject: jest.fn(),
  findBySprint: jest.fn(),
  findByAssignee: jest.fn(),
  findByParent: jest.fn(),
});

const issueHistoryPersistenceMock = (): Record<string, jest.Mock> => ({
  save: jest.fn(),
  deleteByProject: jest.fn(),
});

describe("UpdateIssueService", () => {
  let service: UpdateIssueService;
  let issuePersistence: jest.Mocked<IssuePersistencePort>;
  let issueQuery: jest.Mocked<IssueQueryPort>;
  let issueHistoryPersistence: jest.Mocked<IssueHistoryPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateIssueService,
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

    service = module.get(UpdateIssueService);
    issuePersistence = module.get(DIToken.IssueModule.IssuePersistencePort);
    issueQuery = module.get(DIToken.IssueModule.IssueQueryPort);
    issueHistoryPersistence = module.get(
      DIToken.IssueModule.IssueHistoryPersistencePort,
    );
  });

  it("변경 사항이 있으면 이슈를 업데이트하고 히스토리를 저장해야 한다", async () => {
    const doc = makeIssueDoc({ title: "Old Title" });
    issueQuery.findById.mockResolvedValue(doc as never);
    issuePersistence.update.mockResolvedValue(undefined);
    issueHistoryPersistence.save.mockResolvedValue(undefined);

    const id = new IssueId(new Types.ObjectId());
    const actor = new UserId(new Types.ObjectId());

    await service.invoke(id, actor, { title: "New Title" });

    expect(issueQuery.findById).toHaveBeenCalledWith(id);
    expect(issuePersistence.update).toHaveBeenCalledWith(id, {
      title: "New Title",
    });
    expect(issueHistoryPersistence.save).toHaveBeenCalledTimes(1);
  });

  it("변경 사항이 없으면 히스토리를 저장하지 않아야 한다", async () => {
    const doc = makeIssueDoc({ title: "Same Title" });
    issueQuery.findById.mockResolvedValue(doc as never);
    issuePersistence.update.mockResolvedValue(undefined);

    const id = new IssueId(new Types.ObjectId());
    const actor = new UserId(new Types.ObjectId());

    await service.invoke(id, actor, { title: "Same Title" });

    expect(issuePersistence.update).toHaveBeenCalledWith(id, {
      title: "Same Title",
    });
    expect(issueHistoryPersistence.save).not.toHaveBeenCalled();
  });

  it("null에서 값으로 변경하면 히스토리에 기록해야 한다", async () => {
    const doc = makeIssueDoc({ description: null });
    issueQuery.findById.mockResolvedValue(doc as never);
    issuePersistence.update.mockResolvedValue(undefined);
    issueHistoryPersistence.save.mockResolvedValue(undefined);

    const id = new IssueId(new Types.ObjectId());
    const actor = new UserId(new Types.ObjectId());

    await service.invoke(id, actor, { description: "Added description" });

    expect(issueHistoryPersistence.save).toHaveBeenCalledTimes(1);
  });

  it("에러가 발생하면 전파되어야 한다", async () => {
    issueQuery.findById.mockRejectedValue(new Error("Not found"));

    const id = new IssueId(new Types.ObjectId());
    const actor = new UserId(new Types.ObjectId());

    await expect(service.invoke(id, actor, { title: "Test" })).rejects.toThrow(
      "Not found",
    );
  });
});
