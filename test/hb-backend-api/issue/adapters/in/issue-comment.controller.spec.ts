import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { IssueCommentController } from "../../../../../src/hb-backend-api/issue/adapters/in/issue-comment.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { IssueId } from "../../../../../src/hb-backend-api/issue/domain/model/issue-id.vo";
import { IssueCommentId } from "../../../../../src/hb-backend-api/issue/domain/model/issue-comment-id.vo";
import { ProjectId } from "../../../../../src/hb-backend-api/project/domain/model/project-id.vo";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { TokenUserInformation } from "../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("IssueCommentController", () => {
  let controller: IssueCommentController;

  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockCreateIssueCommentUseCase = { invoke: jest.fn() };
  const mockUpdateIssueCommentUseCase = { invoke: jest.fn() };
  const mockDeleteIssueCommentUseCase = { invoke: jest.fn() };
  const mockGetIssueCommentsUseCase = { invoke: jest.fn() };

  const userOid = new Types.ObjectId();
  const mockUserId = UserId.fromString(userOid.toHexString());
  const mockUser = { getId: mockUserId };
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
    accessToken: "token-123",
  };

  const projectOid = new Types.ObjectId();
  const projectId = ProjectId.fromString(projectOid.toHexString());
  const issueOid = new Types.ObjectId();
  const issueId = IssueId.fromString(issueOid.toHexString());
  const commentOid = new Types.ObjectId();
  const commentId = IssueCommentId.fromString(commentOid.toHexString());

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IssueCommentController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.IssueModule.CreateIssueCommentUseCase,
          useValue: mockCreateIssueCommentUseCase,
        },
        {
          provide: DIToken.IssueModule.UpdateIssueCommentUseCase,
          useValue: mockUpdateIssueCommentUseCase,
        },
        {
          provide: DIToken.IssueModule.DeleteIssueCommentUseCase,
          useValue: mockDeleteIssueCommentUseCase,
        },
        {
          provide: DIToken.IssueModule.GetIssueCommentsUseCase,
          useValue: mockGetIssueCommentsUseCase,
        },
      ],
    }).compile();

    controller = module.get(IssueCommentController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  describe("create", () => {
    it("should resolve user and call createIssueCommentUseCase", async () => {
      mockCreateIssueCommentUseCase.invoke.mockResolvedValue(undefined);

      await controller.create(userInfo, projectId, issueId, {
        body: "LGTM",
      });

      expect(mockGetUserByNicknameUseCase.invoke).toHaveBeenCalledTimes(1);
      expect(mockCreateIssueCommentUseCase.invoke).toHaveBeenCalledWith(
        issueId,
        projectId,
        mockUserId,
        "LGTM",
      );
    });

    it("should propagate errors", async () => {
      mockCreateIssueCommentUseCase.invoke.mockRejectedValue(
        new Error("issue not found"),
      );

      await expect(
        controller.create(userInfo, projectId, issueId, { body: "hi" }),
      ).rejects.toThrow("issue not found");
    });
  });

  describe("getAll", () => {
    it("should return mapped GetIssueCommentDto array", async () => {
      const now = new Date();
      const mockDoc = {
        _id: commentOid,
        issue: issueOid,
        author: userOid,
        body: "Nice work",
        editedAt: null,
        createdAt: now,
      };
      mockGetIssueCommentsUseCase.invoke.mockResolvedValue([mockDoc]);

      const result = await controller.getAll(issueId);

      expect(mockGetIssueCommentsUseCase.invoke).toHaveBeenCalledWith(issueId);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(commentOid.toHexString());
      expect(result[0].body).toBe("Nice work");
      expect(result[0].editedAt).toBeNull();
      expect(result[0].createdAt).toBe(now);
    });

    it("should return empty array when no comments", async () => {
      mockGetIssueCommentsUseCase.invoke.mockResolvedValue([]);

      const result = await controller.getAll(issueId);

      expect(result).toEqual([]);
    });
  });

  describe("update", () => {
    it("should call updateIssueCommentUseCase with id and body", async () => {
      mockUpdateIssueCommentUseCase.invoke.mockResolvedValue(undefined);

      await controller.update(commentId, { body: "Updated comment" });

      expect(mockUpdateIssueCommentUseCase.invoke).toHaveBeenCalledWith(
        commentId,
        "Updated comment",
      );
    });

    it("should propagate errors", async () => {
      mockUpdateIssueCommentUseCase.invoke.mockRejectedValue(
        new Error("not found"),
      );

      await expect(controller.update(commentId, { body: "x" })).rejects.toThrow(
        "not found",
      );
    });
  });

  describe("delete", () => {
    it("should call deleteIssueCommentUseCase", async () => {
      mockDeleteIssueCommentUseCase.invoke.mockResolvedValue(undefined);

      await controller.delete(commentId);

      expect(mockDeleteIssueCommentUseCase.invoke).toHaveBeenCalledWith(
        commentId,
      );
    });

    it("should propagate errors", async () => {
      mockDeleteIssueCommentUseCase.invoke.mockRejectedValue(
        new Error("forbidden"),
      );

      await expect(controller.delete(commentId)).rejects.toThrow("forbidden");
    });
  });
});
