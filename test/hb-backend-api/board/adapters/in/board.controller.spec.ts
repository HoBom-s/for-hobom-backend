import { Test, TestingModule } from "@nestjs/testing";
import { BoardController } from "../../../../../src/hb-backend-api/board/adapters/in/board.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { BoardType } from "../../../../../src/hb-backend-api/board/domain/enums/board-type.enum";
import { BoardId } from "../../../../../src/hb-backend-api/board/domain/model/board-id.vo";
import { Types } from "mongoose";
import { TokenUserInformation } from "../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("BoardController", () => {
  let controller: BoardController;

  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockCreateBoardUseCase = { invoke: jest.fn() };
  const mockGetBoardUseCase = { invoke: jest.fn() };
  const mockGetBoardsByProjectUseCase = { invoke: jest.fn() };
  const mockUpdateBoardUseCase = { invoke: jest.fn() };
  const mockDeleteBoardUseCase = { invoke: jest.fn() };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
  const mockUser = { getId: userId };
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
    accessToken: "token-123",
  };
  const projectIdStr = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.BoardModule.CreateBoardUseCase,
          useValue: mockCreateBoardUseCase,
        },
        {
          provide: DIToken.BoardModule.GetBoardUseCase,
          useValue: mockGetBoardUseCase,
        },
        {
          provide: DIToken.BoardModule.GetBoardsByProjectUseCase,
          useValue: mockGetBoardsByProjectUseCase,
        },
        {
          provide: DIToken.BoardModule.UpdateBoardUseCase,
          useValue: mockUpdateBoardUseCase,
        },
        {
          provide: DIToken.BoardModule.DeleteBoardUseCase,
          useValue: mockDeleteBoardUseCase,
        },
      ],
    }).compile();

    controller = module.get(BoardController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  describe("create", () => {
    it("should resolve user and call createBoardUseCase", async () => {
      mockCreateBoardUseCase.invoke.mockResolvedValue(undefined);

      await controller.create(userInfo, projectIdStr, {
        name: "Sprint Board",
        type: BoardType.KANBAN,
      });

      expect(mockGetUserByNicknameUseCase.invoke).toHaveBeenCalledTimes(1);
      expect(mockCreateBoardUseCase.invoke).toHaveBeenCalledTimes(1);
      const args = mockCreateBoardUseCase.invoke.mock.calls[0];
      expect(args[0].toString()).toBe(projectIdStr);
      expect(args[1]).toBe("Sprint Board");
      expect(args[2]).toBe(BoardType.KANBAN);
      expect(args[3]).toBe(userId);
    });

    it("should propagate use case error", async () => {
      mockCreateBoardUseCase.invoke.mockRejectedValue(new Error("fail"));

      await expect(
        controller.create(userInfo, projectIdStr, {
          name: "Board",
          type: BoardType.SCRUM,
        }),
      ).rejects.toThrow("fail");
    });
  });

  describe("getAll", () => {
    it("should return mapped GetBoardDto array", async () => {
      const boardId = new Types.ObjectId();
      const projectOid = new Types.ObjectId(projectIdStr);
      const createdByOid = new Types.ObjectId();
      const mockDocs = [
        {
          _id: boardId,
          project: projectOid,
          name: "Board 1",
          type: BoardType.KANBAN,
          columns: [],
          createdBy: createdByOid,
        },
      ];
      mockGetBoardsByProjectUseCase.invoke.mockResolvedValue(mockDocs);

      const result = await controller.getAll(projectIdStr);

      expect(mockGetBoardsByProjectUseCase.invoke).toHaveBeenCalledTimes(1);
      expect(
        mockGetBoardsByProjectUseCase.invoke.mock.calls[0][0].toString(),
      ).toBe(projectIdStr);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Board 1");
      expect(result[0].type).toBe(BoardType.KANBAN);
    });

    it("should propagate use case error", async () => {
      mockGetBoardsByProjectUseCase.invoke.mockRejectedValue(new Error("fail"));

      await expect(controller.getAll(projectIdStr)).rejects.toThrow("fail");
    });
  });

  describe("getOne", () => {
    it("should return mapped GetBoardDto", async () => {
      const boardOid = new Types.ObjectId();
      const boardId = BoardId.fromString(boardOid.toHexString());
      const mockDoc = {
        _id: boardOid,
        project: new Types.ObjectId(),
        name: "My Board",
        type: BoardType.SCRUM,
        columns: [{ statusId: "s1", name: "Todo", wipLimit: null, order: 0 }],
        createdBy: new Types.ObjectId(),
      };
      mockGetBoardUseCase.invoke.mockResolvedValue(mockDoc);

      const result = await controller.getOne(boardId);

      expect(mockGetBoardUseCase.invoke).toHaveBeenCalledWith(boardId);
      expect(result.name).toBe("My Board");
      expect(result.columns).toHaveLength(1);
    });
  });

  describe("update", () => {
    it("should pass name and columns to updateBoardUseCase", async () => {
      const boardId = BoardId.fromString(new Types.ObjectId().toHexString());
      const columns = [{ statusId: "s1", name: "Done", wipLimit: 5, order: 0 }];
      mockUpdateBoardUseCase.invoke.mockResolvedValue(undefined);

      await controller.update(boardId, { name: "Renamed", columns });

      expect(mockUpdateBoardUseCase.invoke).toHaveBeenCalledWith(boardId, {
        name: "Renamed",
        columns,
      });
    });

    it("should omit undefined fields from data", async () => {
      const boardId = BoardId.fromString(new Types.ObjectId().toHexString());
      mockUpdateBoardUseCase.invoke.mockResolvedValue(undefined);

      await controller.update(boardId, { name: "Only name" });

      const data = mockUpdateBoardUseCase.invoke.mock.calls[0][1];
      expect(data).toEqual({ name: "Only name" });
      expect(data).not.toHaveProperty("columns");
    });
  });

  describe("delete", () => {
    it("should call deleteBoardUseCase with boardId", async () => {
      const boardId = BoardId.fromString(new Types.ObjectId().toHexString());
      mockDeleteBoardUseCase.invoke.mockResolvedValue(undefined);

      await controller.delete(boardId);

      expect(mockDeleteBoardUseCase.invoke).toHaveBeenCalledWith(boardId);
    });

    it("should propagate use case error", async () => {
      const boardId = BoardId.fromString(new Types.ObjectId().toHexString());
      mockDeleteBoardUseCase.invoke.mockRejectedValue(new Error("not found"));

      await expect(controller.delete(boardId)).rejects.toThrow("not found");
    });
  });
});
