import { Types } from "mongoose";
import { NoteQueryAdapter } from "../../../../../src/hb-backend-api/note/adapters/out/note-query.adapter";
import { NoteRepository } from "../../../../../src/hb-backend-api/note/domain/model/note.repository";
import { NoteEntitySchema } from "../../../../../src/hb-backend-api/note/domain/model/note.entity";
import { NoteId } from "../../../../../src/hb-backend-api/note/domain/model/note-id.vo";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { NoteType } from "../../../../../src/hb-backend-api/note/domain/enums/note-type.enum";
import { NoteStatus } from "../../../../../src/hb-backend-api/note/domain/enums/note-status.enum";
import { Recurrence } from "../../../../../src/hb-backend-api/note/domain/enums/recurrence.enum";

describe("NoteQueryAdapter", () => {
  let adapter: NoteQueryAdapter;
  let repository: jest.Mocked<NoteRepository>;

  const createMockDoc = (overrides = {}) => ({
    _id: new Types.ObjectId(),
    owner: new Types.ObjectId(),
    members: [],
    title: "Test Note",
    content: "Note content",
    type: NoteType.TEXT,
    checklistItems: [],
    color: "#FFFFFF",
    isPinned: false,
    status: NoteStatus.ACTIVE,
    trashedAt: null,
    labels: [],
    reminder: null,
    order: 0,
    ...overrides,
  });

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      deleteOne: jest.fn(),
      deleteAllTrashed: jest.fn(),
      deleteTrashedBefore: jest.fn(),
      findMinOrder: jest.fn(),
      addMember: jest.fn(),
      removeMember: jest.fn(),
    };
    adapter = new NoteQueryAdapter(repository);
  });

  describe("findById()", () => {
    it("should return a NoteEntitySchema mapped from the document", async () => {
      const doc = createMockDoc();
      repository.findById.mockResolvedValue(doc as never);

      const noteId = new NoteId(new Types.ObjectId());
      const userId = new UserId(new Types.ObjectId());
      const result = await adapter.findById(noteId, userId);

      expect(repository.findById).toHaveBeenCalledWith(noteId, userId);
      expect(result).toBeInstanceOf(NoteEntitySchema);
      expect(result.getTitle).toBe("Test Note");
      expect(result.getContent).toBe("Note content");
      expect(result.getType).toBe(NoteType.TEXT);
      expect(result.getIsPinned).toBe(false);
      expect(result.getStatus).toBe(NoteStatus.ACTIVE);
      expect(result.getOrder).toBe(0);
    });

    it("should map members correctly", async () => {
      const memberId = new Types.ObjectId();
      const doc = createMockDoc({ members: [memberId] });
      repository.findById.mockResolvedValue(doc as never);

      const result = await adapter.findById(
        new NoteId(new Types.ObjectId()),
        new UserId(new Types.ObjectId()),
      );

      expect(result.getMembers).toHaveLength(1);
    });

    it("should map checklistItems correctly", async () => {
      const doc = createMockDoc({
        type: NoteType.CHECKLIST,
        checklistItems: [{ text: "Item 1", checked: false, order: 0 }],
      });
      repository.findById.mockResolvedValue(doc as never);

      const result = await adapter.findById(
        new NoteId(new Types.ObjectId()),
        new UserId(new Types.ObjectId()),
      );

      expect(result.getChecklistItems).toHaveLength(1);
      expect(result.getChecklistItems[0].getText).toBe("Item 1");
    });

    it("should map labels correctly", async () => {
      const labelId = new Types.ObjectId();
      const doc = createMockDoc({ labels: [labelId] });
      repository.findById.mockResolvedValue(doc as never);

      const result = await adapter.findById(
        new NoteId(new Types.ObjectId()),
        new UserId(new Types.ObjectId()),
      );

      expect(result.getLabels).toHaveLength(1);
    });

    it("should map reminder when present", async () => {
      const doc = createMockDoc({
        reminder: {
          date: new Date("2026-03-14"),
          recurrence: Recurrence.DAILY,
        },
      });
      repository.findById.mockResolvedValue(doc as never);

      const result = await adapter.findById(
        new NoteId(new Types.ObjectId()),
        new UserId(new Types.ObjectId()),
      );

      expect(result.getReminder).not.toBeNull();
      expect(result.getReminder!.getRecurrence).toBe(Recurrence.DAILY);
    });

    it("should set reminder to null when absent", async () => {
      const doc = createMockDoc({ reminder: null });
      repository.findById.mockResolvedValue(doc as never);

      const result = await adapter.findById(
        new NoteId(new Types.ObjectId()),
        new UserId(new Types.ObjectId()),
      );

      expect(result.getReminder).toBeNull();
    });
  });

  describe("findAll()", () => {
    it("should return mapped NoteEntitySchema array", async () => {
      repository.findAll.mockResolvedValue([createMockDoc()] as never);

      const userId = new UserId(new Types.ObjectId());
      const result = await adapter.findAll(userId, NoteStatus.ACTIVE);

      expect(repository.findAll).toHaveBeenCalledWith(
        userId,
        NoteStatus.ACTIVE,
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(NoteEntitySchema);
    });

    it("should return empty array when no documents exist", async () => {
      repository.findAll.mockResolvedValue([]);

      const userId = new UserId(new Types.ObjectId());
      const result = await adapter.findAll(userId, NoteStatus.ACTIVE);

      expect(result).toEqual([]);
    });
  });

  describe("findMinOrder()", () => {
    it("should return the minimum order value from repository", async () => {
      repository.findMinOrder.mockResolvedValue(5);

      const userId = new UserId(new Types.ObjectId());
      const result = await adapter.findMinOrder(userId);

      expect(repository.findMinOrder).toHaveBeenCalledWith(userId);
      expect(result).toBe(5);
    });

    it("should return 0 when repository returns 0", async () => {
      repository.findMinOrder.mockResolvedValue(0);

      const userId = new UserId(new Types.ObjectId());
      const result = await adapter.findMinOrder(userId);

      expect(result).toBe(0);
    });
  });
});
