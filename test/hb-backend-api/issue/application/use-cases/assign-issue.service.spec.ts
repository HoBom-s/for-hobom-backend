import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { AssignIssueService } from "src/hb-backend-api/issue/application/use-cases/assign-issue.service";
import { DIToken } from "src/shared/di/token.di";
import { TransactionRunner } from "src/infra/mongo/transaction/transaction.runner";
import { IssueId } from "src/hb-backend-api/issue/domain/model/issue-id.vo";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";

const projectId = new Types.ObjectId();

const makeIssueDoc = (overrides: Record<string, unknown> = {}) => ({
  _id: new Types.ObjectId(),
  project: projectId,
  assignee: null,
  ...overrides,
});

describe("AssignIssueService", () => {
  let service: AssignIssueService;
  const mockUpdate = jest.fn();
  const mockFindById = jest.fn();
  const mockSaveHistory = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    mockFindById.mockResolvedValue(makeIssueDoc());
    mockUpdate.mockResolvedValue(undefined);
    mockSaveHistory.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignIssueService,
        {
          provide: DIToken.IssueModule.IssuePersistencePort,
          useValue: { update: mockUpdate },
        },
        {
          provide: DIToken.IssueModule.IssueQueryPort,
          useValue: { findById: mockFindById },
        },
        {
          provide: DIToken.IssueModule.IssueHistoryPersistencePort,
          useValue: { save: mockSaveHistory },
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb: () => unknown) => cb()) },
        },
      ],
    }).compile();

    service = module.get(AssignIssueService);
  });

  const issueId = IssueId.fromString(new Types.ObjectId().toHexString());
  const actorId = UserId.fromString(new Types.ObjectId().toHexString());

  it("assignee를 설정하면 해당 유저로 업데이트해야 한다", async () => {
    const assignee = UserId.fromString(new Types.ObjectId().toHexString());
    await service.invoke(issueId, assignee, actorId);

    expect(mockUpdate).toHaveBeenCalledWith(issueId, {
      assignee: assignee.raw,
    });
    expect(mockSaveHistory).toHaveBeenCalled();
  });

  it("assignee를 null로 설정하면 null로 업데이트해야 한다", async () => {
    await service.invoke(issueId, null, actorId);

    expect(mockUpdate).toHaveBeenCalledWith(issueId, { assignee: null });
    expect(mockSaveHistory).toHaveBeenCalled();
  });

  it("기존 assignee가 있을 때 히스토리에 from 값이 기록되어야 한다", async () => {
    const existingAssignee = new Types.ObjectId();
    mockFindById.mockResolvedValue(
      makeIssueDoc({ assignee: existingAssignee }),
    );

    const newAssignee = UserId.fromString(new Types.ObjectId().toHexString());
    await service.invoke(issueId, newAssignee, actorId);

    expect(mockSaveHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        changes: [
          expect.objectContaining({
            field: "assignee",
            from: String(existingAssignee),
            to: newAssignee.toString(),
          }),
        ],
      }),
    );
  });
});
