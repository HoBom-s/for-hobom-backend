import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { SprintController } from "../../../../../src/hb-backend-api/sprint/adapters/in/sprint.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { ProjectId } from "../../../../../src/hb-backend-api/project/domain/model/project-id.vo";
import { SprintId } from "../../../../../src/hb-backend-api/sprint/domain/model/sprint-id.vo";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { TokenUserInformation } from "../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("SprintController", () => {
  let controller: SprintController;

  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockCreateSprintUseCase = { invoke: jest.fn() };
  const mockGetSprintUseCase = { invoke: jest.fn() };
  const mockGetSprintsByProjectUseCase = { invoke: jest.fn() };
  const mockUpdateSprintUseCase = { invoke: jest.fn() };
  const mockDeleteSprintUseCase = { invoke: jest.fn() };
  const mockStartSprintUseCase = { invoke: jest.fn() };
  const mockCompleteSprintUseCase = { invoke: jest.fn() };

  const userOid = new Types.ObjectId();
  const mockUserId = UserId.fromString(userOid.toHexString());
  const mockUser = { getId: mockUserId };
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
    accessToken: "token-123",
  };

  const projectOid = new Types.ObjectId();
  const projectId = ProjectId.fromString(projectOid.toHexString());
  const sprintOid = new Types.ObjectId();
  const sprintId = SprintId.fromString(sprintOid.toHexString());

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SprintController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.SprintModule.CreateSprintUseCase,
          useValue: mockCreateSprintUseCase,
        },
        {
          provide: DIToken.SprintModule.GetSprintUseCase,
          useValue: mockGetSprintUseCase,
        },
        {
          provide: DIToken.SprintModule.GetSprintsByProjectUseCase,
          useValue: mockGetSprintsByProjectUseCase,
        },
        {
          provide: DIToken.SprintModule.UpdateSprintUseCase,
          useValue: mockUpdateSprintUseCase,
        },
        {
          provide: DIToken.SprintModule.DeleteSprintUseCase,
          useValue: mockDeleteSprintUseCase,
        },
        {
          provide: DIToken.SprintModule.StartSprintUseCase,
          useValue: mockStartSprintUseCase,
        },
        {
          provide: DIToken.SprintModule.CompleteSprintUseCase,
          useValue: mockCompleteSprintUseCase,
        },
      ],
    }).compile();

    controller = module.get(SprintController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  describe("create", () => {
    it("should resolve user and call createSprintUseCase", async () => {
      mockCreateSprintUseCase.invoke.mockResolvedValue(undefined);

      await controller.create(userInfo, projectId, {
        name: "Sprint 1",
        goal: "Ship v1",
        startDate: "2026-03-01",
        endDate: "2026-03-15",
      });

      expect(mockGetUserByNicknameUseCase.invoke).toHaveBeenCalledTimes(1);
      expect(mockCreateSprintUseCase.invoke).toHaveBeenCalledWith(
        projectId,
        "Sprint 1",
        "Ship v1",
        new Date("2026-03-01"),
        new Date("2026-03-15"),
        mockUserId,
      );
    });

    it("should pass null goal when omitted", async () => {
      mockCreateSprintUseCase.invoke.mockResolvedValue(undefined);

      await controller.create(userInfo, projectId, {
        name: "Sprint 2",
        startDate: "2026-04-01",
        endDate: "2026-04-15",
      });

      expect(mockCreateSprintUseCase.invoke).toHaveBeenCalledWith(
        projectId,
        "Sprint 2",
        null,
        new Date("2026-04-01"),
        new Date("2026-04-15"),
        mockUserId,
      );
    });

    it("should propagate errors", async () => {
      mockCreateSprintUseCase.invoke.mockRejectedValue(new Error("overlap"));

      await expect(
        controller.create(userInfo, projectId, {
          name: "Sprint X",
          startDate: "2026-03-01",
          endDate: "2026-03-15",
        }),
      ).rejects.toThrow("overlap");
    });
  });

  describe("getByProject", () => {
    it("should return mapped GetSprintDto array", async () => {
      const start = new Date("2026-03-01");
      const end = new Date("2026-03-15");
      const mockDoc = {
        _id: sprintOid,
        project: projectOid,
        name: "Sprint 1",
        goal: "Ship v1",
        status: "PLANNING",
        startDate: start,
        endDate: end,
        completedAt: null,
        createdBy: userOid,
      };
      mockGetSprintsByProjectUseCase.invoke.mockResolvedValue([mockDoc]);

      const result = await controller.getByProject(projectId);

      expect(mockGetSprintsByProjectUseCase.invoke).toHaveBeenCalledWith(
        projectId,
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(sprintOid.toHexString());
      expect(result[0].name).toBe("Sprint 1");
      expect(result[0].status).toBe("PLANNING");
    });
  });

  describe("getOne", () => {
    it("should return mapped GetSprintDto", async () => {
      const start = new Date("2026-03-01");
      const end = new Date("2026-03-15");
      const mockDoc = {
        _id: sprintOid,
        project: projectOid,
        name: "Sprint 1",
        goal: null,
        status: "ACTIVE",
        startDate: start,
        endDate: end,
        completedAt: null,
        createdBy: userOid,
      };
      mockGetSprintUseCase.invoke.mockResolvedValue(mockDoc);

      const result = await controller.getOne(sprintId);

      expect(mockGetSprintUseCase.invoke).toHaveBeenCalledWith(sprintId);
      expect(result.id).toBe(sprintOid.toHexString());
      expect(result.goal).toBeNull();
    });

    it("should propagate not-found errors", async () => {
      mockGetSprintUseCase.invoke.mockRejectedValue(
        new Error("스프린트를 찾을 수 없어요."),
      );

      await expect(controller.getOne(sprintId)).rejects.toThrow(
        "스프린트를 찾을 수 없어요.",
      );
    });
  });

  describe("update", () => {
    it("should call updateSprintUseCase with correct args", async () => {
      mockUpdateSprintUseCase.invoke.mockResolvedValue(undefined);

      await controller.update(sprintId, {
        name: "Sprint 1 (updated)",
        goal: "New goal",
        startDate: "2026-03-02",
        endDate: "2026-03-16",
      });

      expect(mockUpdateSprintUseCase.invoke).toHaveBeenCalledWith(
        sprintId,
        "Sprint 1 (updated)",
        "New goal",
        new Date("2026-03-02"),
        new Date("2026-03-16"),
      );
    });

    it("should pass null goal when omitted", async () => {
      mockUpdateSprintUseCase.invoke.mockResolvedValue(undefined);

      await controller.update(sprintId, {
        name: "Sprint 1",
        startDate: "2026-03-01",
        endDate: "2026-03-15",
      });

      expect(mockUpdateSprintUseCase.invoke).toHaveBeenCalledWith(
        sprintId,
        "Sprint 1",
        null,
        new Date("2026-03-01"),
        new Date("2026-03-15"),
      );
    });
  });

  describe("delete", () => {
    it("should call deleteSprintUseCase", async () => {
      mockDeleteSprintUseCase.invoke.mockResolvedValue(undefined);

      await controller.delete(sprintId);

      expect(mockDeleteSprintUseCase.invoke).toHaveBeenCalledWith(sprintId);
    });

    it("should propagate errors", async () => {
      mockDeleteSprintUseCase.invoke.mockRejectedValue(new Error("forbidden"));

      await expect(controller.delete(sprintId)).rejects.toThrow("forbidden");
    });
  });

  describe("start", () => {
    it("should call startSprintUseCase", async () => {
      mockStartSprintUseCase.invoke.mockResolvedValue(undefined);

      await controller.start(sprintId);

      expect(mockStartSprintUseCase.invoke).toHaveBeenCalledWith(sprintId);
    });

    it("should propagate errors", async () => {
      mockStartSprintUseCase.invoke.mockRejectedValue(
        new Error("already active"),
      );

      await expect(controller.start(sprintId)).rejects.toThrow(
        "already active",
      );
    });
  });

  describe("complete", () => {
    it("should call completeSprintUseCase", async () => {
      mockCompleteSprintUseCase.invoke.mockResolvedValue(undefined);

      await controller.complete(sprintId);

      expect(mockCompleteSprintUseCase.invoke).toHaveBeenCalledWith(sprintId);
    });

    it("should propagate errors", async () => {
      mockCompleteSprintUseCase.invoke.mockRejectedValue(
        new Error("not started"),
      );

      await expect(controller.complete(sprintId)).rejects.toThrow(
        "not started",
      );
    });
  });
});
