import { Test } from "@nestjs/testing";
import { Types } from "mongoose";
import { BadRequestException } from "@nestjs/common";
import { CreateNoteService } from "src/hb-backend-api/note/application/use-cases/create-note.service";
import { GetAllNotesService } from "src/hb-backend-api/note/application/use-cases/get-all-notes.service";
import { GetNoteByIdService } from "src/hb-backend-api/note/application/use-cases/get-note-by-id.service";
import { UpdateNoteService } from "src/hb-backend-api/note/application/use-cases/update-note.service";
import { UpdateNoteStatusService } from "src/hb-backend-api/note/application/use-cases/update-note-status.service";
import { ToggleNotePinService } from "src/hb-backend-api/note/application/use-cases/toggle-note-pin.service";
import { ReorderNoteService } from "src/hb-backend-api/note/application/use-cases/reorder-note.service";
import { DeleteNoteService } from "src/hb-backend-api/note/application/use-cases/delete-note.service";
import { EmptyTrashService } from "src/hb-backend-api/note/application/use-cases/empty-trash.service";
import { NotePersistencePort } from "src/hb-backend-api/note/domain/ports/out/note-persistence.port";
import { NoteQueryPort } from "src/hb-backend-api/note/domain/ports/out/note-query.port";
import { DIToken } from "src/shared/di/token.di";
import { TransactionRunner } from "src/infra/mongo/transaction/transaction.runner";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { NoteId } from "src/hb-backend-api/note/domain/model/note-id.vo";
import { NoteColor } from "src/hb-backend-api/note/domain/model/note-color.vo";
import { ChecklistItem } from "src/hb-backend-api/note/domain/model/checklist-item";
import { NoteReminder } from "src/hb-backend-api/note/domain/model/note-reminder";
import { NoteEntitySchema } from "src/hb-backend-api/note/domain/model/note.entity";
import { CreateNoteCommand } from "src/hb-backend-api/note/domain/ports/out/create-note.command";
import { UpdateNoteCommand } from "src/hb-backend-api/note/domain/ports/out/update-note.command";
import { NoteType } from "src/hb-backend-api/note/domain/enums/note-type.enum";
import { NoteStatus } from "src/hb-backend-api/note/domain/enums/note-status.enum";
import { Recurrence } from "src/hb-backend-api/note/domain/enums/recurrence.enum";
import { LabelId } from "src/hb-backend-api/label/domain/model/label-id.vo";

// ──────────────────────────────────────────────
// Test Factories
// ──────────────────────────────────────────────
const makeOwner = () => new UserId(new Types.ObjectId());
const makeNoteId = () => new NoteId(new Types.ObjectId());
const makeLabelId = () => new LabelId(new Types.ObjectId());

const makeNoteEntity = (
  overrides: Partial<{
    id: NoteId;
    owner: UserId;
    isPinned: boolean;
    status: NoteStatus;
    order: number;
  }> = {},
): NoteEntitySchema =>
  NoteEntitySchema.of(
    overrides.id ?? makeNoteId(),
    overrides.owner ?? makeOwner(),
    "테스트 노트",
    "내용입니다",
    NoteType.TEXT,
    [],
    NoteColor.fromString("#FFCCAA"),
    overrides.isPinned ?? false,
    overrides.status ?? NoteStatus.ACTIVE,
    null,
    [],
    null,
    overrides.order ?? 0,
  );

const mockPersistencePort = (): jest.Mocked<NotePersistencePort> => ({
  save: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  togglePin: jest.fn(),
  updateOrder: jest.fn(),
  deleteOne: jest.fn(),
  emptyTrash: jest.fn(),
});

const mockQueryPort = (): jest.Mocked<NoteQueryPort> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findMinOrder: jest.fn(),
});

const mockTransactionRunner = () => ({
  run: jest.fn((cb: () => Promise<void>) => cb()),
});

// ──────────────────────────────────────────────
// CreateNoteService
// ──────────────────────────────────────────────
describe("CreateNoteService", () => {
  let service: CreateNoteService;
  let persistencePort: jest.Mocked<NotePersistencePort>;
  let queryPort: jest.Mocked<NoteQueryPort>;

  beforeEach(async () => {
    persistencePort = mockPersistencePort();
    queryPort = mockQueryPort();
    const module = await Test.createTestingModule({
      providers: [
        CreateNoteService,
        {
          provide: DIToken.NoteModule.NotePersistencePort,
          useValue: persistencePort,
        },
        { provide: DIToken.NoteModule.NoteQueryPort, useValue: queryPort },
        { provide: TransactionRunner, useValue: mockTransactionRunner() },
      ],
    }).compile();
    service = module.get(CreateNoteService);
  });

  it("should create a note with order = minOrder - 1", async () => {
    queryPort.findMinOrder.mockResolvedValue(5);
    const owner = makeOwner();
    const command = CreateNoteCommand.of(
      owner,
      "제목",
      "내용",
      NoteType.TEXT,
      [],
      NoteColor.fromString("#FFFFFF"),
      [],
      null,
    );

    await service.invoke(command);

    expect(queryPort.findMinOrder).toHaveBeenCalledWith(owner);
    expect(persistencePort.save).toHaveBeenCalledTimes(1);
    const savedSchema = persistencePort.save.mock.calls[0][0];
    expect(savedSchema.getOrder).toBe(4);
    expect(savedSchema.getTitle).toBe("제목");
  });

  it("should set order to -1 when no existing notes (minOrder = 0)", async () => {
    queryPort.findMinOrder.mockResolvedValue(0);
    const command = CreateNoteCommand.of(
      makeOwner(),
      null,
      null,
      NoteType.CHECKLIST,
      [ChecklistItem.of("할 일", false, 0)],
      NoteColor.fromString(null),
      [],
      null,
    );

    await service.invoke(command);

    const savedSchema = persistencePort.save.mock.calls[0][0];
    expect(savedSchema.getOrder).toBe(-1);
    expect(savedSchema.getChecklistItems).toHaveLength(1);
  });
});

// ──────────────────────────────────────────────
// GetAllNotesService
// ──────────────────────────────────────────────
describe("GetAllNotesService", () => {
  let service: GetAllNotesService;
  let queryPort: jest.Mocked<NoteQueryPort>;

  beforeEach(async () => {
    queryPort = mockQueryPort();
    const module = await Test.createTestingModule({
      providers: [
        GetAllNotesService,
        { provide: DIToken.NoteModule.NoteQueryPort, useValue: queryPort },
      ],
    }).compile();
    service = module.get(GetAllNotesService);
  });

  it("should return mapped NoteQueryResult list", async () => {
    const owner = makeOwner();
    queryPort.findAll.mockResolvedValue([
      makeNoteEntity({ owner }),
      makeNoteEntity({ owner }),
    ]);

    const result = await service.invoke(owner, NoteStatus.ACTIVE);

    expect(queryPort.findAll).toHaveBeenCalledWith(owner, NoteStatus.ACTIVE);
    expect(result).toHaveLength(2);
  });

  it("should return empty array when no notes", async () => {
    queryPort.findAll.mockResolvedValue([]);

    const result = await service.invoke(makeOwner(), NoteStatus.ARCHIVED);

    expect(result).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// GetNoteByIdService
// ──────────────────────────────────────────────
describe("GetNoteByIdService", () => {
  let service: GetNoteByIdService;
  let queryPort: jest.Mocked<NoteQueryPort>;

  beforeEach(async () => {
    queryPort = mockQueryPort();
    const module = await Test.createTestingModule({
      providers: [
        GetNoteByIdService,
        { provide: DIToken.NoteModule.NoteQueryPort, useValue: queryPort },
      ],
    }).compile();
    service = module.get(GetNoteByIdService);
  });

  it("should return a NoteQueryResult by id", async () => {
    const noteId = makeNoteId();
    const owner = makeOwner();
    const entity = makeNoteEntity({ id: noteId, owner });
    queryPort.findById.mockResolvedValue(entity);

    const result = await service.invoke(noteId, owner);

    expect(queryPort.findById).toHaveBeenCalledWith(noteId, owner);
    expect(result.getId).toEqual(noteId);
  });
});

// ──────────────────────────────────────────────
// UpdateNoteService
// ──────────────────────────────────────────────
describe("UpdateNoteService", () => {
  let service: UpdateNoteService;
  let persistencePort: jest.Mocked<NotePersistencePort>;
  let queryPort: jest.Mocked<NoteQueryPort>;

  beforeEach(async () => {
    persistencePort = mockPersistencePort();
    queryPort = mockQueryPort();
    const module = await Test.createTestingModule({
      providers: [
        UpdateNoteService,
        {
          provide: DIToken.NoteModule.NotePersistencePort,
          useValue: persistencePort,
        },
        { provide: DIToken.NoteModule.NoteQueryPort, useValue: queryPort },
        { provide: TransactionRunner, useValue: mockTransactionRunner() },
      ],
    }).compile();
    service = module.get(UpdateNoteService);
  });

  it("should update only provided fields", async () => {
    const noteId = makeNoteId();
    const owner = makeOwner();
    const entity = makeNoteEntity({ id: noteId, owner });
    queryPort.findById.mockResolvedValue(entity);

    const command = UpdateNoteCommand.of(owner, "새 제목");

    await service.invoke(noteId, command);

    expect(persistencePort.update).toHaveBeenCalledWith(noteId, owner, {
      title: "새 제목",
    });
  });

  it("should not call update when no fields changed", async () => {
    const noteId = makeNoteId();
    const owner = makeOwner();
    queryPort.findById.mockResolvedValue(makeNoteEntity({ id: noteId, owner }));

    const command = UpdateNoteCommand.of(owner);

    await service.invoke(noteId, command);

    expect(persistencePort.update).not.toHaveBeenCalled();
  });

  it("should handle checklist, color, labels, and reminder updates", async () => {
    const noteId = makeNoteId();
    const owner = makeOwner();
    const labelId = makeLabelId();
    queryPort.findById.mockResolvedValue(makeNoteEntity({ id: noteId, owner }));

    const items = [ChecklistItem.of("아이템", true, 0)];
    const color = NoteColor.fromString("#FF0000");
    const reminder = NoteReminder.of(new Date("2026-03-01"), Recurrence.DAILY);
    const command = UpdateNoteCommand.of(
      owner,
      undefined,
      undefined,
      items,
      color,
      [labelId],
      reminder,
    );

    await service.invoke(noteId, command);

    const data = persistencePort.update.mock.calls[0][2];
    expect(data.checklistItems).toEqual([
      { text: "아이템", checked: true, order: 0 },
    ]);
    expect(data.color).toBe("#FF0000");
    expect(data.labels).toEqual([labelId.raw]);
    expect(data.reminder).toEqual({
      date: new Date("2026-03-01"),
      recurrence: Recurrence.DAILY,
    });
  });
});

// ──────────────────────────────────────────────
// UpdateNoteStatusService
// ──────────────────────────────────────────────
describe("UpdateNoteStatusService", () => {
  let service: UpdateNoteStatusService;
  let persistencePort: jest.Mocked<NotePersistencePort>;
  let queryPort: jest.Mocked<NoteQueryPort>;

  beforeEach(async () => {
    persistencePort = mockPersistencePort();
    queryPort = mockQueryPort();
    const module = await Test.createTestingModule({
      providers: [
        UpdateNoteStatusService,
        {
          provide: DIToken.NoteModule.NotePersistencePort,
          useValue: persistencePort,
        },
        { provide: DIToken.NoteModule.NoteQueryPort, useValue: queryPort },
        { provide: TransactionRunner, useValue: mockTransactionRunner() },
      ],
    }).compile();
    service = module.get(UpdateNoteStatusService);
  });

  it("should set trashedAt when target status is TRASHED", async () => {
    const noteId = makeNoteId();
    const owner = makeOwner();
    queryPort.findById.mockResolvedValue(makeNoteEntity({ id: noteId, owner }));

    await service.invoke(noteId, owner, NoteStatus.TRASHED);

    expect(persistencePort.updateStatus).toHaveBeenCalledWith(
      noteId,
      owner,
      NoteStatus.TRASHED,
      expect.any(Date),
    );
  });

  it("should set trashedAt to null when restoring from trash", async () => {
    const noteId = makeNoteId();
    const owner = makeOwner();
    queryPort.findById.mockResolvedValue(
      makeNoteEntity({ id: noteId, owner, status: NoteStatus.TRASHED }),
    );

    await service.invoke(noteId, owner, NoteStatus.ACTIVE);

    expect(persistencePort.updateStatus).toHaveBeenCalledWith(
      noteId,
      owner,
      NoteStatus.ACTIVE,
      null,
    );
  });

  it("should set trashedAt to null when status is ARCHIVED", async () => {
    const noteId = makeNoteId();
    const owner = makeOwner();
    queryPort.findById.mockResolvedValue(makeNoteEntity({ id: noteId, owner }));

    await service.invoke(noteId, owner, NoteStatus.ARCHIVED);

    expect(persistencePort.updateStatus).toHaveBeenCalledWith(
      noteId,
      owner,
      NoteStatus.ARCHIVED,
      null,
    );
  });
});

// ──────────────────────────────────────────────
// ToggleNotePinService
// ──────────────────────────────────────────────
describe("ToggleNotePinService", () => {
  let service: ToggleNotePinService;
  let persistencePort: jest.Mocked<NotePersistencePort>;
  let queryPort: jest.Mocked<NoteQueryPort>;

  beforeEach(async () => {
    persistencePort = mockPersistencePort();
    queryPort = mockQueryPort();
    const module = await Test.createTestingModule({
      providers: [
        ToggleNotePinService,
        {
          provide: DIToken.NoteModule.NotePersistencePort,
          useValue: persistencePort,
        },
        { provide: DIToken.NoteModule.NoteQueryPort, useValue: queryPort },
        { provide: TransactionRunner, useValue: mockTransactionRunner() },
      ],
    }).compile();
    service = module.get(ToggleNotePinService);
  });

  it("should pin an unpinned note", async () => {
    const noteId = makeNoteId();
    const owner = makeOwner();
    queryPort.findById.mockResolvedValue(
      makeNoteEntity({ id: noteId, owner, isPinned: false }),
    );

    await service.invoke(noteId, owner);

    expect(persistencePort.togglePin).toHaveBeenCalledWith(noteId, owner, true);
  });

  it("should unpin a pinned note", async () => {
    const noteId = makeNoteId();
    const owner = makeOwner();
    queryPort.findById.mockResolvedValue(
      makeNoteEntity({ id: noteId, owner, isPinned: true }),
    );

    await service.invoke(noteId, owner);

    expect(persistencePort.togglePin).toHaveBeenCalledWith(
      noteId,
      owner,
      false,
    );
  });
});

// ──────────────────────────────────────────────
// ReorderNoteService
// ──────────────────────────────────────────────
describe("ReorderNoteService", () => {
  let service: ReorderNoteService;
  let persistencePort: jest.Mocked<NotePersistencePort>;
  let queryPort: jest.Mocked<NoteQueryPort>;

  beforeEach(async () => {
    persistencePort = mockPersistencePort();
    queryPort = mockQueryPort();
    const module = await Test.createTestingModule({
      providers: [
        ReorderNoteService,
        {
          provide: DIToken.NoteModule.NotePersistencePort,
          useValue: persistencePort,
        },
        { provide: DIToken.NoteModule.NoteQueryPort, useValue: queryPort },
        { provide: TransactionRunner, useValue: mockTransactionRunner() },
      ],
    }).compile();
    service = module.get(ReorderNoteService);
  });

  it("should update the note order", async () => {
    const noteId = makeNoteId();
    const owner = makeOwner();
    queryPort.findById.mockResolvedValue(
      makeNoteEntity({ id: noteId, owner, order: 0 }),
    );

    await service.invoke(noteId, owner, 5);

    expect(persistencePort.updateOrder).toHaveBeenCalledWith(noteId, owner, 5);
  });
});

// ──────────────────────────────────────────────
// DeleteNoteService
// ──────────────────────────────────────────────
describe("DeleteNoteService", () => {
  let service: DeleteNoteService;
  let persistencePort: jest.Mocked<NotePersistencePort>;
  let queryPort: jest.Mocked<NoteQueryPort>;

  beforeEach(async () => {
    persistencePort = mockPersistencePort();
    queryPort = mockQueryPort();
    const module = await Test.createTestingModule({
      providers: [
        DeleteNoteService,
        {
          provide: DIToken.NoteModule.NotePersistencePort,
          useValue: persistencePort,
        },
        { provide: DIToken.NoteModule.NoteQueryPort, useValue: queryPort },
        { provide: TransactionRunner, useValue: mockTransactionRunner() },
      ],
    }).compile();
    service = module.get(DeleteNoteService);
  });

  it("should delete a trashed note", async () => {
    const noteId = makeNoteId();
    const owner = makeOwner();
    queryPort.findById.mockResolvedValue(
      makeNoteEntity({ id: noteId, owner, status: NoteStatus.TRASHED }),
    );

    await service.invoke(noteId, owner);

    expect(persistencePort.deleteOne).toHaveBeenCalledWith(noteId, owner);
  });

  it("should throw BadRequestException when note is ACTIVE", async () => {
    const noteId = makeNoteId();
    const owner = makeOwner();
    queryPort.findById.mockResolvedValue(
      makeNoteEntity({ id: noteId, owner, status: NoteStatus.ACTIVE }),
    );

    await expect(service.invoke(noteId, owner)).rejects.toThrow(
      BadRequestException,
    );
    expect(persistencePort.deleteOne).not.toHaveBeenCalled();
  });

  it("should throw BadRequestException when note is ARCHIVED", async () => {
    const noteId = makeNoteId();
    const owner = makeOwner();
    queryPort.findById.mockResolvedValue(
      makeNoteEntity({ id: noteId, owner, status: NoteStatus.ARCHIVED }),
    );

    await expect(service.invoke(noteId, owner)).rejects.toThrow(
      BadRequestException,
    );
    expect(persistencePort.deleteOne).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// EmptyTrashService
// ──────────────────────────────────────────────
describe("EmptyTrashService", () => {
  let service: EmptyTrashService;
  let persistencePort: jest.Mocked<NotePersistencePort>;

  beforeEach(async () => {
    persistencePort = mockPersistencePort();
    const module = await Test.createTestingModule({
      providers: [
        EmptyTrashService,
        {
          provide: DIToken.NoteModule.NotePersistencePort,
          useValue: persistencePort,
        },
        { provide: TransactionRunner, useValue: mockTransactionRunner() },
      ],
    }).compile();
    service = module.get(EmptyTrashService);
  });

  it("should call emptyTrash with owner", async () => {
    const owner = makeOwner();

    await service.invoke(owner);

    expect(persistencePort.emptyTrash).toHaveBeenCalledWith(owner);
  });
});
