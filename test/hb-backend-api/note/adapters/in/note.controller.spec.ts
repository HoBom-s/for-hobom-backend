import { Test, TestingModule } from "@nestjs/testing";
import { NoteController } from "../../../../../src/hb-backend-api/note/adapters/in/note.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { NoteStatus } from "../../../../../src/hb-backend-api/note/domain/enums/note-status.enum";
import { NoteType } from "../../../../../src/hb-backend-api/note/domain/enums/note-type.enum";
import { Types } from "mongoose";
import { TokenUserInformation } from "../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("NoteController", () => {
  let controller: NoteController;

  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockCreateNoteUseCase = { invoke: jest.fn() };
  const mockGetAllNotesUseCase = { invoke: jest.fn() };
  const mockGetNoteByIdUseCase = { invoke: jest.fn() };
  const mockUpdateNoteUseCase = { invoke: jest.fn() };
  const mockUpdateNoteStatusUseCase = { invoke: jest.fn() };
  const mockToggleNotePinUseCase = { invoke: jest.fn() };
  const mockReorderNoteUseCase = { invoke: jest.fn() };
  const mockDeleteNoteUseCase = { invoke: jest.fn() };
  const mockEmptyTrashUseCase = { invoke: jest.fn() };
  const mockAddNoteMemberUseCase = { invoke: jest.fn() };
  const mockRemoveNoteMemberUseCase = { invoke: jest.fn() };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
  const mockUser = { getId: userId };
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
    accessToken: "token-123",
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoteController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.NoteModule.CreateNoteUseCase,
          useValue: mockCreateNoteUseCase,
        },
        {
          provide: DIToken.NoteModule.GetAllNotesUseCase,
          useValue: mockGetAllNotesUseCase,
        },
        {
          provide: DIToken.NoteModule.GetNoteByIdUseCase,
          useValue: mockGetNoteByIdUseCase,
        },
        {
          provide: DIToken.NoteModule.UpdateNoteUseCase,
          useValue: mockUpdateNoteUseCase,
        },
        {
          provide: DIToken.NoteModule.UpdateNoteStatusUseCase,
          useValue: mockUpdateNoteStatusUseCase,
        },
        {
          provide: DIToken.NoteModule.ToggleNotePinUseCase,
          useValue: mockToggleNotePinUseCase,
        },
        {
          provide: DIToken.NoteModule.ReorderNoteUseCase,
          useValue: mockReorderNoteUseCase,
        },
        {
          provide: DIToken.NoteModule.DeleteNoteUseCase,
          useValue: mockDeleteNoteUseCase,
        },
        {
          provide: DIToken.NoteModule.EmptyTrashUseCase,
          useValue: mockEmptyTrashUseCase,
        },
        {
          provide: DIToken.NoteModule.AddNoteMemberUseCase,
          useValue: mockAddNoteMemberUseCase,
        },
        {
          provide: DIToken.NoteModule.RemoveNoteMemberUseCase,
          useValue: mockRemoveNoteMemberUseCase,
        },
      ],
    }).compile();

    controller = module.get(NoteController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  describe("create", () => {
    it("should resolve user and call createNoteUseCase", async () => {
      mockCreateNoteUseCase.invoke.mockResolvedValue(undefined);

      await controller.create(userInfo, {
        type: NoteType.TEXT,
        title: "Test Note",
        content: "body",
      });

      expect(mockGetUserByNicknameUseCase.invoke).toHaveBeenCalledTimes(1);
      expect(mockCreateNoteUseCase.invoke).toHaveBeenCalledTimes(1);
    });

    it("should propagate use case error", async () => {
      mockCreateNoteUseCase.invoke.mockRejectedValue(new Error("fail"));

      await expect(
        controller.create(userInfo, { type: NoteType.TEXT }),
      ).rejects.toThrow("fail");
    });
  });

  describe("findAll", () => {
    it("should return notes with default ACTIVE status", async () => {
      const mockNotes = [{ id: "1" }, { id: "2" }];
      mockGetAllNotesUseCase.invoke.mockResolvedValue(mockNotes);

      const result = await controller.findAll(userInfo);

      expect(mockGetAllNotesUseCase.invoke).toHaveBeenCalledWith(
        userId,
        NoteStatus.ACTIVE,
      );
      expect(result).toEqual(mockNotes);
    });

    it("should pass explicit status to use case", async () => {
      mockGetAllNotesUseCase.invoke.mockResolvedValue([]);

      await controller.findAll(userInfo, NoteStatus.TRASHED);

      expect(mockGetAllNotesUseCase.invoke).toHaveBeenCalledWith(
        userId,
        NoteStatus.TRASHED,
      );
    });

    it("should propagate use case error", async () => {
      mockGetAllNotesUseCase.invoke.mockRejectedValue(new Error("fail"));

      await expect(controller.findAll(userInfo)).rejects.toThrow("fail");
    });
  });

  describe("findById", () => {
    it("should call getNoteByIdUseCase with noteId and userId", async () => {
      const noteId = { raw: new Types.ObjectId() } as any;
      const mockNote = { id: "note-1" };
      mockGetNoteByIdUseCase.invoke.mockResolvedValue(mockNote);

      const result = await controller.findById(userInfo, noteId);

      expect(mockGetNoteByIdUseCase.invoke).toHaveBeenCalledWith(
        noteId,
        userId,
      );
      expect(result).toEqual(mockNote);
    });
  });

  describe("update", () => {
    it("should call updateNoteUseCase with noteId and command", async () => {
      const noteId = { raw: new Types.ObjectId() } as any;
      mockUpdateNoteUseCase.invoke.mockResolvedValue(undefined);

      await controller.update(userInfo, noteId, { title: "Updated" });

      expect(mockUpdateNoteUseCase.invoke).toHaveBeenCalledTimes(1);
      expect(mockUpdateNoteUseCase.invoke.mock.calls[0][0]).toBe(noteId);
    });
  });

  describe("updateStatus", () => {
    it("should call updateNoteStatusUseCase with correct args", async () => {
      const noteId = { raw: new Types.ObjectId() } as any;
      mockUpdateNoteStatusUseCase.invoke.mockResolvedValue(undefined);

      await controller.updateStatus(userInfo, noteId, {
        status: NoteStatus.ARCHIVED,
      });

      expect(mockUpdateNoteStatusUseCase.invoke).toHaveBeenCalledWith(
        noteId,
        userId,
        NoteStatus.ARCHIVED,
      );
    });
  });

  describe("togglePin", () => {
    it("should call toggleNotePinUseCase with noteId and userId", async () => {
      const noteId = { raw: new Types.ObjectId() } as any;
      mockToggleNotePinUseCase.invoke.mockResolvedValue(undefined);

      await controller.togglePin(userInfo, noteId);

      expect(mockToggleNotePinUseCase.invoke).toHaveBeenCalledWith(
        noteId,
        userId,
      );
    });
  });

  describe("reorder", () => {
    it("should call reorderNoteUseCase with noteId, userId, and order", async () => {
      const noteId = { raw: new Types.ObjectId() } as any;
      mockReorderNoteUseCase.invoke.mockResolvedValue(undefined);

      await controller.reorder(userInfo, noteId, { order: 3 });

      expect(mockReorderNoteUseCase.invoke).toHaveBeenCalledWith(
        noteId,
        userId,
        3,
      );
    });
  });

  describe("addMember", () => {
    it("should call addNoteMemberUseCase with parsed userId", async () => {
      const noteId = { raw: new Types.ObjectId() } as any;
      const memberIdStr = new Types.ObjectId().toHexString();
      mockAddNoteMemberUseCase.invoke.mockResolvedValue(undefined);

      await controller.addMember(userInfo, noteId, { userId: memberIdStr });

      expect(mockAddNoteMemberUseCase.invoke).toHaveBeenCalledTimes(1);
      const args = mockAddNoteMemberUseCase.invoke.mock.calls[0];
      expect(args[0]).toBe(noteId);
      expect(args[1]).toBe(userId);
      expect(args[2].toString()).toBe(memberIdStr);
    });
  });

  describe("removeMember", () => {
    it("should call removeNoteMemberUseCase with parsed memberUserId", async () => {
      const noteId = { raw: new Types.ObjectId() } as any;
      const memberIdStr = new Types.ObjectId().toHexString();
      mockRemoveNoteMemberUseCase.invoke.mockResolvedValue(undefined);

      await controller.removeMember(userInfo, noteId, memberIdStr);

      expect(mockRemoveNoteMemberUseCase.invoke).toHaveBeenCalledTimes(1);
      const args = mockRemoveNoteMemberUseCase.invoke.mock.calls[0];
      expect(args[0]).toBe(noteId);
      expect(args[1]).toBe(userId);
      expect(args[2].toString()).toBe(memberIdStr);
    });
  });

  describe("emptyTrash", () => {
    it("should call emptyTrashUseCase with userId", async () => {
      mockEmptyTrashUseCase.invoke.mockResolvedValue(undefined);

      await controller.emptyTrash(userInfo);

      expect(mockEmptyTrashUseCase.invoke).toHaveBeenCalledWith(userId);
    });
  });

  describe("delete", () => {
    it("should call deleteNoteUseCase with noteId and userId", async () => {
      const noteId = { raw: new Types.ObjectId() } as any;
      mockDeleteNoteUseCase.invoke.mockResolvedValue(undefined);

      await controller.delete(userInfo, noteId);

      expect(mockDeleteNoteUseCase.invoke).toHaveBeenCalledWith(noteId, userId);
    });

    it("should propagate use case error", async () => {
      const noteId = { raw: new Types.ObjectId() } as any;
      mockDeleteNoteUseCase.invoke.mockRejectedValue(new Error("not found"));

      await expect(controller.delete(userInfo, noteId)).rejects.toThrow(
        "not found",
      );
    });
  });
});
