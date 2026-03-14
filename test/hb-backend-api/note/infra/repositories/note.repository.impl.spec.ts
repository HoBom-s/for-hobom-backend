import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { NoteRepositoryImpl } from "../../../../../src/hb-backend-api/note/infra/repositories/note.repository.impl";
import { NoteEntity } from "../../../../../src/hb-backend-api/note/domain/model/note.entity";
import { NoteId } from "../../../../../src/hb-backend-api/note/domain/model/note-id.vo";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { NoteStatus } from "../../../../../src/hb-backend-api/note/domain/enums/note-status.enum";

jest.mock("src/infra/mongo/transaction/transaction.context", () => ({
  MongoSessionContext: { getSession: jest.fn().mockReturnValue(undefined) },
}));

describe("NoteRepositoryImpl", () => {
  let repository: NoteRepositoryImpl;

  const mockExec = jest.fn();
  const mockLean = jest.fn().mockReturnValue({ exec: mockExec });
  const mockSelectChainLean = jest.fn().mockReturnValue({ exec: mockExec });
  const mockSelect = jest.fn().mockReturnValue({ lean: mockSelectChainLean });
  const mockSort = jest.fn().mockReturnValue({ select: mockSelect });
  const mockFindAllExec = jest.fn();
  const mockFindAllLean = jest.fn().mockReturnValue({ exec: mockFindAllExec });
  const mockFindAllSort = jest.fn().mockReturnValue({ lean: mockFindAllLean });

  const mockModel = {
    create: jest.fn(),
    findOne: jest.fn().mockReturnValue({ lean: mockLean, sort: mockSort }),
    find: jest.fn().mockReturnValue({ sort: mockFindAllSort }),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
  };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
  const noteId = NoteId.fromString(new Types.ObjectId().toHexString());

  beforeEach(async () => {
    jest.clearAllMocks();
    mockModel.findOne.mockReturnValue({ lean: mockLean, sort: mockSort });
    mockLean.mockReturnValue({ exec: mockExec });
    mockSelectChainLean.mockReturnValue({ exec: mockExec });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoteRepositoryImpl,
        {
          provide: getModelToken(NoteEntity.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get(NoteRepositoryImpl);
  });

  describe("findById", () => {
    it("should return document when found", async () => {
      const doc = { _id: noteId.raw, title: "test" };
      mockExec.mockResolvedValue(doc);

      const result = await repository.findById(noteId, userId);

      expect(mockModel.findOne).toHaveBeenCalledWith({
        _id: noteId.raw,
        $or: [{ owner: userId.raw }, { members: userId.raw }],
      });
      expect(result).toBe(doc);
    });

    it("should throw NotFoundException when document is null", async () => {
      mockExec.mockResolvedValue(null);

      await expect(repository.findById(noteId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findMinOrder", () => {
    it("should return result.order when document exists", async () => {
      mockExec.mockResolvedValue({ order: 5 });

      const result = await repository.findMinOrder(userId);

      expect(mockModel.findOne).toHaveBeenCalledWith({
        $or: [{ owner: userId.raw }, { members: userId.raw }],
      });
      expect(mockSort).toHaveBeenCalledWith({ order: 1 });
      expect(mockSelect).toHaveBeenCalledWith("order");
      expect(result).toBe(5);
    });

    it("should return 0 when no document found", async () => {
      mockExec.mockResolvedValue(null);

      const result = await repository.findMinOrder(userId);

      expect(result).toBe(0);
    });
  });

  describe("save", () => {
    const baseSchema = {
      getOwner: { raw: new Types.ObjectId() },
      getTitle: "Test Note",
      getContent: "content",
      getType: "TEXT",
      getChecklistItems: [],
      getColor: { raw: "#FFFFFF" },
      getLabels: [],
      getOrder: 1,
    };

    it("should save with reminder.toPlain() when reminder exists", async () => {
      const reminderPlain = {
        date: new Date("2026-04-01"),
        recurrence: "NONE",
      };
      const schema = {
        ...baseSchema,
        getReminder: { toPlain: () => reminderPlain },
      };
      mockModel.create.mockResolvedValue(undefined);

      await repository.save(schema as any);

      expect(mockModel.create).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            owner: baseSchema.getOwner.raw,
            title: "Test Note",
            content: "content",
            reminder: reminderPlain,
            order: 1,
          }),
        ],
        { session: undefined },
      );
    });

    it("should save with null reminder when reminder is null", async () => {
      const schema = { ...baseSchema, getReminder: null };
      mockModel.create.mockResolvedValue(undefined);

      await repository.save(schema as any);

      const createArg = mockModel.create.mock.calls[0][0][0];
      expect(createArg.reminder).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should query by userId and status with sort", async () => {
      const docs = [{ _id: new Types.ObjectId(), title: "a" }];
      mockFindAllExec.mockResolvedValue(docs);

      const result = await repository.findAll(userId, NoteStatus.ACTIVE);

      expect(mockModel.find).toHaveBeenCalledWith({
        $or: [{ owner: userId.raw }, { members: userId.raw }],
        status: NoteStatus.ACTIVE,
      });
      expect(mockFindAllSort).toHaveBeenCalledWith({
        isPinned: -1,
        order: 1,
      });
      expect(result).toBe(docs);
    });
  });

  describe("update", () => {
    it("should call findOneAndUpdate with $set", async () => {
      const data = { title: "updated" };
      mockModel.findOneAndUpdate.mockResolvedValue(undefined);

      await repository.update(noteId, userId, data);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: noteId.raw,
          $or: [{ owner: userId.raw }, { members: userId.raw }],
        },
        { $set: data },
        { session: undefined },
      );
    });
  });

  describe("deleteOne", () => {
    it("should delete by id and owner", async () => {
      mockModel.deleteOne.mockResolvedValue(undefined);

      await repository.deleteOne(noteId, userId);

      expect(mockModel.deleteOne).toHaveBeenCalledWith(
        { _id: noteId.raw, owner: userId.raw },
        { session: undefined },
      );
    });
  });

  describe("deleteAllTrashed", () => {
    it("should delete all trashed notes for owner", async () => {
      mockModel.deleteMany.mockResolvedValue(undefined);

      await repository.deleteAllTrashed(userId);

      expect(mockModel.deleteMany).toHaveBeenCalledWith(
        { owner: userId.raw, status: NoteStatus.TRASHED },
        { session: undefined },
      );
    });
  });

  describe("deleteTrashedBefore", () => {
    it("should delete trashed notes before threshold and return count", async () => {
      const threshold = new Date("2026-01-01");
      mockModel.deleteMany.mockResolvedValue({ deletedCount: 3 });

      const result = await repository.deleteTrashedBefore(threshold);

      expect(mockModel.deleteMany).toHaveBeenCalledWith(
        { status: NoteStatus.TRASHED, trashedAt: { $lte: threshold } },
        { session: undefined },
      );
      expect(result).toBe(3);
    });
  });

  describe("addMember", () => {
    it("should push member userId", async () => {
      const memberId = UserId.fromString(new Types.ObjectId().toHexString());
      mockModel.findOneAndUpdate.mockResolvedValue(undefined);

      await repository.addMember(noteId, memberId);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: noteId.raw },
        { $push: { members: memberId.raw } },
        { session: undefined },
      );
    });
  });

  describe("removeMember", () => {
    it("should pull member userId", async () => {
      const memberId = UserId.fromString(new Types.ObjectId().toHexString());
      mockModel.findOneAndUpdate.mockResolvedValue(undefined);

      await repository.removeMember(noteId, memberId);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: noteId.raw },
        { $pull: { members: memberId.raw } },
        { session: undefined },
      );
    });
  });
});
