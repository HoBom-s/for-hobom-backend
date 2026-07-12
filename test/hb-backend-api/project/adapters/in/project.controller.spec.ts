import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { ProjectController } from "../../../../../src/hb-backend-api/project/adapters/in/project.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { ProjectId } from "../../../../../src/hb-backend-api/project/domain/model/project-id.vo";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { MemberRole } from "../../../../../src/hb-backend-api/project/domain/enums/member-role.enum";
import { TokenUserInformation } from "../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("ProjectController", () => {
  let controller: ProjectController;

  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockCreateProjectUseCase = { invoke: jest.fn() };
  const mockGetProjectUseCase = { invoke: jest.fn() };
  const mockGetMyProjectsUseCase = { invoke: jest.fn() };
  const mockUpdateProjectUseCase = { invoke: jest.fn() };
  const mockDeleteProjectUseCase = { invoke: jest.fn() };
  const mockAddProjectMemberUseCase = { invoke: jest.fn() };
  const mockRemoveProjectMemberUseCase = { invoke: jest.fn() };
  const mockUpdateProjectMemberRoleUseCase = { invoke: jest.fn() };
  const mockUpdateProjectWorkflowUseCase = { invoke: jest.fn() };
  const mockUpdateProjectIssueTypesUseCase = { invoke: jest.fn() };
  const mockUpdateProjectPrioritiesUseCase = { invoke: jest.fn() };

  const userOid = new Types.ObjectId();
  const mockUserId = UserId.fromString(userOid.toHexString());
  const mockUser = { getId: mockUserId };
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
    accessToken: "token-123",
  };

  const projectOid = new Types.ObjectId();
  const projectId = ProjectId.fromString(projectOid.toHexString());

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.ProjectModule.CreateProjectUseCase,
          useValue: mockCreateProjectUseCase,
        },
        {
          provide: DIToken.ProjectModule.GetProjectUseCase,
          useValue: mockGetProjectUseCase,
        },
        {
          provide: DIToken.ProjectModule.GetMyProjectsUseCase,
          useValue: mockGetMyProjectsUseCase,
        },
        {
          provide: DIToken.ProjectModule.UpdateProjectUseCase,
          useValue: mockUpdateProjectUseCase,
        },
        {
          provide: DIToken.ProjectModule.DeleteProjectUseCase,
          useValue: mockDeleteProjectUseCase,
        },
        {
          provide: DIToken.ProjectModule.AddProjectMemberUseCase,
          useValue: mockAddProjectMemberUseCase,
        },
        {
          provide: DIToken.ProjectModule.RemoveProjectMemberUseCase,
          useValue: mockRemoveProjectMemberUseCase,
        },
        {
          provide: DIToken.ProjectModule.UpdateProjectMemberRoleUseCase,
          useValue: mockUpdateProjectMemberRoleUseCase,
        },
        {
          provide: DIToken.ProjectModule.UpdateProjectWorkflowUseCase,
          useValue: mockUpdateProjectWorkflowUseCase,
        },
        {
          provide: DIToken.ProjectModule.UpdateProjectIssueTypesUseCase,
          useValue: mockUpdateProjectIssueTypesUseCase,
        },
        {
          provide: DIToken.ProjectModule.UpdateProjectPrioritiesUseCase,
          useValue: mockUpdateProjectPrioritiesUseCase,
        },
      ],
    }).compile();

    controller = module.get(ProjectController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  describe("create", () => {
    it("should resolve user and call createProjectUseCase", async () => {
      mockCreateProjectUseCase.invoke.mockResolvedValue(undefined);

      await controller.create(userInfo, {
        key: "HB",
        name: "Hobom",
        description: "desc",
      });

      expect(mockGetUserByNicknameUseCase.invoke).toHaveBeenCalledTimes(1);
      expect(mockCreateProjectUseCase.invoke).toHaveBeenCalledWith(
        expect.objectContaining({ raw: "HB" }),
        "Hobom",
        "desc",
        mockUserId,
      );
    });

    it("should pass null description when omitted", async () => {
      mockCreateProjectUseCase.invoke.mockResolvedValue(undefined);

      await controller.create(userInfo, { key: "AB", name: "Test" });

      expect(mockCreateProjectUseCase.invoke).toHaveBeenCalledWith(
        expect.anything(),
        "Test",
        null,
        mockUserId,
      );
    });

    it("should propagate errors", async () => {
      mockCreateProjectUseCase.invoke.mockRejectedValue(
        new Error("duplicate key"),
      );

      await expect(
        controller.create(userInfo, { key: "HB", name: "Hobom" }),
      ).rejects.toThrow("duplicate key");
    });
  });

  describe("getMyProjects", () => {
    it("should resolve user and return mapped GetProjectDto array", async () => {
      const now = new Date();
      const mockDoc = {
        _id: projectOid,
        key: "HB",
        name: "Hobom",
        description: null,
        owner: userOid,
        members: [{ userId: userOid, role: MemberRole.ADMIN, joinedAt: now }],
        issueSequence: 0,
      };
      mockGetMyProjectsUseCase.invoke.mockResolvedValue([mockDoc]);

      const result = await controller.getMyProjects(userInfo);

      expect(mockGetMyProjectsUseCase.invoke).toHaveBeenCalledWith(mockUserId);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(projectOid.toHexString());
      expect(result[0].key).toBe("HB");
      expect(result[0].members[0].role).toBe(MemberRole.ADMIN);
    });
  });

  describe("getOne", () => {
    it("should return mapped GetProjectDto", async () => {
      const now = new Date();
      const mockDoc = {
        _id: projectOid,
        key: "HB",
        name: "Hobom",
        description: "my project",
        owner: userOid,
        members: [{ userId: userOid, role: MemberRole.ADMIN, joinedAt: now }],
        issueSequence: 5,
      };
      mockGetProjectUseCase.invoke.mockResolvedValue(mockDoc);

      const result = await controller.getOne(projectId);

      expect(mockGetProjectUseCase.invoke).toHaveBeenCalledWith(projectId);
      expect(result.id).toBe(projectOid.toHexString());
      expect(result.issueSequence).toBe(5);
    });

    it("should propagate not-found errors", async () => {
      mockGetProjectUseCase.invoke.mockRejectedValue(
        new Error("프로젝트를 찾을 수 없어요."),
      );

      await expect(controller.getOne(projectId)).rejects.toThrow(
        "프로젝트를 찾을 수 없어요.",
      );
    });
  });

  describe("update", () => {
    it("should call updateProjectUseCase", async () => {
      mockUpdateProjectUseCase.invoke.mockResolvedValue(undefined);

      await controller.update(projectId, {
        name: "Updated",
        description: "new desc",
      });

      expect(mockUpdateProjectUseCase.invoke).toHaveBeenCalledWith(
        projectId,
        "Updated",
        "new desc",
      );
    });

    it("should pass null description when omitted", async () => {
      mockUpdateProjectUseCase.invoke.mockResolvedValue(undefined);

      await controller.update(projectId, { name: "Only Name" });

      expect(mockUpdateProjectUseCase.invoke).toHaveBeenCalledWith(
        projectId,
        "Only Name",
        null,
      );
    });
  });

  describe("delete", () => {
    it("should call deleteProjectUseCase", async () => {
      mockDeleteProjectUseCase.invoke.mockResolvedValue(undefined);

      await controller.delete(projectId);

      expect(mockDeleteProjectUseCase.invoke).toHaveBeenCalledWith(projectId);
    });

    it("should propagate errors", async () => {
      mockDeleteProjectUseCase.invoke.mockRejectedValue(new Error("forbidden"));

      await expect(controller.delete(projectId)).rejects.toThrow("forbidden");
    });
  });

  describe("addMember", () => {
    it("should call addProjectMemberUseCase with parsed UserId", async () => {
      mockAddProjectMemberUseCase.invoke.mockResolvedValue(undefined);
      const memberOid = new Types.ObjectId();

      await controller.addMember(projectId, {
        userId: memberOid.toHexString(),
        role: MemberRole.MEMBER,
      });

      expect(mockAddProjectMemberUseCase.invoke).toHaveBeenCalledWith(
        projectId,
        expect.any(UserId),
        MemberRole.MEMBER,
      );
    });
  });

  describe("removeMember", () => {
    it("should call removeProjectMemberUseCase", async () => {
      mockRemoveProjectMemberUseCase.invoke.mockResolvedValue(undefined);
      const memberOid = new Types.ObjectId();

      await controller.removeMember(projectId, memberOid.toHexString());

      expect(mockRemoveProjectMemberUseCase.invoke).toHaveBeenCalledWith(
        projectId,
        expect.any(UserId),
      );
    });
  });

  describe("updateMemberRole", () => {
    it("should call updateProjectMemberRoleUseCase", async () => {
      mockUpdateProjectMemberRoleUseCase.invoke.mockResolvedValue(undefined);
      const memberOid = new Types.ObjectId();

      await controller.updateMemberRole(projectId, memberOid.toHexString(), {
        role: MemberRole.VIEWER,
      });

      expect(mockUpdateProjectMemberRoleUseCase.invoke).toHaveBeenCalledWith(
        projectId,
        expect.any(UserId),
        MemberRole.VIEWER,
      );
    });
  });

  describe("updateWorkflow", () => {
    it("should call updateProjectWorkflowUseCase with statuses and transitions", async () => {
      mockUpdateProjectWorkflowUseCase.invoke.mockResolvedValue(undefined);

      const statuses = [
        { id: "s1", name: "Todo", isDone: false, order: 0 },
        { id: "s2", name: "Done", isDone: true, order: 1 },
      ];
      const transitions = [{ from: "s1", to: "s2", name: "Complete" }];

      await controller.updateWorkflow(projectId, { statuses, transitions });

      expect(mockUpdateProjectWorkflowUseCase.invoke).toHaveBeenCalledWith(
        projectId,
        { statuses, transitions },
      );
    });
  });

  describe("updateIssueTypes", () => {
    it("should call updateProjectIssueTypesUseCase", async () => {
      mockUpdateProjectIssueTypesUseCase.invoke.mockResolvedValue(undefined);

      const issueTypes = [
        { id: "t1", name: "Task", icon: "check", isSubtask: false },
      ];

      await controller.updateIssueTypes(projectId, { issueTypes });

      expect(mockUpdateProjectIssueTypesUseCase.invoke).toHaveBeenCalledWith(
        projectId,
        issueTypes,
      );
    });
  });

  describe("updatePriorities", () => {
    it("should call updateProjectPrioritiesUseCase", async () => {
      mockUpdateProjectPrioritiesUseCase.invoke.mockResolvedValue(undefined);

      const priorities = [{ id: "p1", name: "High", icon: "fire", order: 0 }];

      await controller.updatePriorities(projectId, { priorities });

      expect(mockUpdateProjectPrioritiesUseCase.invoke).toHaveBeenCalledWith(
        projectId,
        priorities,
      );
    });
  });
});
