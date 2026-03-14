import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { IssueController } from "../../../../../src/hb-backend-api/issue/adapters/in/issue.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { IssueType } from "../../../../../src/hb-backend-api/issue/domain/enums/issue-type.enum";
import { IssuePriority } from "../../../../../src/hb-backend-api/issue/domain/enums/issue-priority.enum";
import { IssueId } from "../../../../../src/hb-backend-api/issue/domain/model/issue-id.vo";
import { ProjectId } from "../../../../../src/hb-backend-api/project/domain/model/project-id.vo";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { TokenUserInformation } from "../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("IssueController", () => {
  let controller: IssueController;

  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockCreateIssueUseCase = { invoke: jest.fn() };
  const mockGetIssueUseCase = { invoke: jest.fn() };
  const mockGetIssuesByProjectUseCase = { invoke: jest.fn() };
  const mockUpdateIssueUseCase = { invoke: jest.fn() };
  const mockDeleteIssueUseCase = { invoke: jest.fn() };
  const mockTransitionIssueStatusUseCase = { invoke: jest.fn() };
  const mockAssignIssueUseCase = { invoke: jest.fn() };

  const userId = new Types.ObjectId();
  const mockUserId = UserId.fromString(userId.toHexString());
  const mockUser = { getId: mockUserId };
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
    accessToken: "token-123",
  };

  const projectOid = new Types.ObjectId();
  const projectId = ProjectId.fromString(projectOid.toHexString());
  const issueOid = new Types.ObjectId();
  const issueId = IssueId.fromString(issueOid.toHexString());

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IssueController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.IssueModule.CreateIssueUseCase,
          useValue: mockCreateIssueUseCase,
        },
        {
          provide: DIToken.IssueModule.GetIssueUseCase,
          useValue: mockGetIssueUseCase,
        },
        {
          provide: DIToken.IssueModule.GetIssuesByProjectUseCase,
          useValue: mockGetIssuesByProjectUseCase,
        },
        {
          provide: DIToken.IssueModule.UpdateIssueUseCase,
          useValue: mockUpdateIssueUseCase,
        },
        {
          provide: DIToken.IssueModule.DeleteIssueUseCase,
          useValue: mockDeleteIssueUseCase,
        },
        {
          provide: DIToken.IssueModule.TransitionIssueStatusUseCase,
          useValue: mockTransitionIssueStatusUseCase,
        },
        {
          provide: DIToken.IssueModule.AssignIssueUseCase,
          useValue: mockAssignIssueUseCase,
        },
      ],
    }).compile();

    controller = module.get(IssueController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  describe("create", () => {
    it("should resolve user and call createIssueUseCase with correct args", async () => {
      mockCreateIssueUseCase.invoke.mockResolvedValue(undefined);
      const assigneeOid = new Types.ObjectId();
      const sprintOid = new Types.ObjectId();
      const parentOid = new Types.ObjectId();

      await controller.create(userInfo, projectId, {
        type: IssueType.TASK,
        title: "Test Issue",
        description: "desc",
        priority: IssuePriority.HIGH,
        assignee: assigneeOid.toHexString(),
        sprint: sprintOid.toHexString(),
        parent: parentOid.toHexString(),
        labels: ["label-1"],
      });

      expect(mockGetUserByNicknameUseCase.invoke).toHaveBeenCalledTimes(1);
      expect(mockCreateIssueUseCase.invoke).toHaveBeenCalledWith(
        projectId,
        IssueType.TASK,
        "Test Issue",
        "desc",
        IssuePriority.HIGH,
        mockUserId,
        expect.any(UserId),
        expect.any(Types.ObjectId),
        expect.any(Types.ObjectId),
        ["label-1"],
      );
    });

    it("should use defaults when optional fields are omitted", async () => {
      mockCreateIssueUseCase.invoke.mockResolvedValue(undefined);

      await controller.create(userInfo, projectId, {
        type: IssueType.BUG,
        title: "Bug",
      });

      expect(mockCreateIssueUseCase.invoke).toHaveBeenCalledWith(
        projectId,
        IssueType.BUG,
        "Bug",
        null,
        IssuePriority.MEDIUM,
        mockUserId,
        null,
        null,
        null,
        [],
      );
    });

    it("should propagate use case errors", async () => {
      mockCreateIssueUseCase.invoke.mockRejectedValue(
        new Error("duplicate key"),
      );

      await expect(
        controller.create(userInfo, projectId, {
          type: IssueType.TASK,
          title: "Test",
        }),
      ).rejects.toThrow("duplicate key");
    });
  });

  describe("getByProject", () => {
    it("should return mapped GetIssueDto array", async () => {
      const reporterOid = new Types.ObjectId();
      const mockDoc = {
        _id: issueOid,
        project: projectOid,
        issueNumber: 1,
        issueKey: "HB-1",
        type: IssueType.TASK,
        title: "Test",
        description: null,
        status: "TODO",
        priority: IssuePriority.MEDIUM,
        resolution: null,
        reporter: reporterOid,
        assignee: null,
        sprint: null,
        parent: null,
        labels: [],
        storyPoints: null,
        dueDate: null,
        resolvedAt: null,
      };
      mockGetIssuesByProjectUseCase.invoke.mockResolvedValue([mockDoc]);

      const result = await controller.getByProject(projectId);

      expect(mockGetIssuesByProjectUseCase.invoke).toHaveBeenCalledWith(
        projectId,
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(issueOid.toHexString());
      expect(result[0].issueKey).toBe("HB-1");
    });
  });

  describe("getOne", () => {
    it("should return mapped GetIssueDto", async () => {
      const reporterOid = new Types.ObjectId();
      const mockDoc = {
        _id: issueOid,
        project: projectOid,
        issueNumber: 1,
        issueKey: "HB-1",
        type: IssueType.TASK,
        title: "Test",
        description: "some desc",
        status: "IN_PROGRESS",
        priority: IssuePriority.HIGH,
        resolution: null,
        reporter: reporterOid,
        assignee: null,
        sprint: null,
        parent: null,
        labels: [],
        storyPoints: 3,
        dueDate: null,
        resolvedAt: null,
      };
      mockGetIssueUseCase.invoke.mockResolvedValue(mockDoc);

      const result = await controller.getOne(issueId);

      expect(mockGetIssueUseCase.invoke).toHaveBeenCalledWith(issueId);
      expect(result.id).toBe(issueOid.toHexString());
      expect(result.title).toBe("Test");
      expect(result.storyPoints).toBe(3);
    });

    it("should propagate not-found errors", async () => {
      mockGetIssueUseCase.invoke.mockRejectedValue(
        new Error("이슈를 찾을 수 없어요."),
      );

      await expect(controller.getOne(issueId)).rejects.toThrow(
        "이슈를 찾을 수 없어요.",
      );
    });
  });

  describe("update", () => {
    it("should resolve user and call updateIssueUseCase with built data", async () => {
      mockUpdateIssueUseCase.invoke.mockResolvedValue(undefined);

      await controller.update(userInfo, issueId, {
        title: "Updated",
        priority: IssuePriority.CRITICAL,
        storyPoints: 5,
      });

      expect(mockUpdateIssueUseCase.invoke).toHaveBeenCalledWith(
        issueId,
        mockUserId,
        { title: "Updated", priority: IssuePriority.CRITICAL, storyPoints: 5 },
      );
    });

    it("should handle parent set to null (unlink)", async () => {
      mockUpdateIssueUseCase.invoke.mockResolvedValue(undefined);

      await controller.update(userInfo, issueId, { parent: null });

      const data = mockUpdateIssueUseCase.invoke.mock.calls[0][2] as Record<
        string,
        unknown
      >;
      expect(data.parent).toBeNull();
    });

    it("should convert sprint to ObjectId", async () => {
      mockUpdateIssueUseCase.invoke.mockResolvedValue(undefined);
      const sprintOid = new Types.ObjectId();

      await controller.update(userInfo, issueId, {
        sprint: sprintOid.toHexString(),
      });

      const data = mockUpdateIssueUseCase.invoke.mock.calls[0][2] as Record<
        string,
        unknown
      >;
      expect(data.sprint).toEqual(new Types.ObjectId(sprintOid.toHexString()));
    });
  });

  describe("delete", () => {
    it("should call deleteIssueUseCase", async () => {
      mockDeleteIssueUseCase.invoke.mockResolvedValue(undefined);

      await controller.delete(issueId);

      expect(mockDeleteIssueUseCase.invoke).toHaveBeenCalledWith(issueId);
    });

    it("should propagate errors", async () => {
      mockDeleteIssueUseCase.invoke.mockRejectedValue(new Error("forbidden"));

      await expect(controller.delete(issueId)).rejects.toThrow("forbidden");
    });
  });

  describe("transition", () => {
    it("should resolve user and call transitionIssueStatusUseCase", async () => {
      mockTransitionIssueStatusUseCase.invoke.mockResolvedValue(undefined);

      await controller.transition(userInfo, issueId, { statusId: "done-1" });

      expect(mockTransitionIssueStatusUseCase.invoke).toHaveBeenCalledWith(
        issueId,
        "done-1",
        mockUserId,
      );
    });
  });

  describe("assign", () => {
    it("should resolve user and call assignIssueUseCase with assignee", async () => {
      mockAssignIssueUseCase.invoke.mockResolvedValue(undefined);
      const assigneeOid = new Types.ObjectId();

      await controller.assign(userInfo, issueId, {
        assignee: assigneeOid.toHexString(),
      });

      expect(mockAssignIssueUseCase.invoke).toHaveBeenCalledWith(
        issueId,
        expect.any(UserId),
        mockUserId,
      );
    });

    it("should pass null assignee when unassigning", async () => {
      mockAssignIssueUseCase.invoke.mockResolvedValue(undefined);

      await controller.assign(userInfo, issueId, {});

      expect(mockAssignIssueUseCase.invoke).toHaveBeenCalledWith(
        issueId,
        null,
        mockUserId,
      );
    });
  });
});
