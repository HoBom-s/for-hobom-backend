import { Test } from "@nestjs/testing";
import { Types } from "mongoose";
import { ProcessNoteRemindService } from "src/hb-backend-api/note/application/use-cases/process-note-remind.service";
import { NoteQueryPort } from "src/hb-backend-api/note/domain/ports/out/note-query.port";
import { OutboxPersistencePort } from "src/hb-backend-api/outbox/domain/ports/out/outbox-persistence.port";
import { UserQueryPort } from "src/hb-backend-api/user/domain/ports/out/user-query.port";
import { DIToken } from "src/shared/di/token.di";
import { TransactionRunner } from "src/infra/mongo/transaction/transaction.runner";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { NoteId } from "src/hb-backend-api/note/domain/model/note-id.vo";
import { NoteColor } from "src/hb-backend-api/note/domain/model/note-color.vo";
import { NoteReminder } from "src/hb-backend-api/note/domain/model/note-reminder";
import { NoteEntitySchema } from "src/hb-backend-api/note/domain/model/note.entity";
import { UserEntitySchema } from "src/hb-backend-api/user/domain/model/user.entity";
import { NoteType } from "src/hb-backend-api/note/domain/enums/note-type.enum";
import { NoteStatus } from "src/hb-backend-api/note/domain/enums/note-status.enum";
import { Recurrence } from "src/hb-backend-api/note/domain/enums/recurrence.enum";
import { CreateOutboxEntity } from "src/hb-backend-api/outbox/domain/model/create-outbox.entity";
import { EventType } from "src/hb-backend-api/outbox/domain/model/event-type.enum";
import { OutboxStatus } from "src/hb-backend-api/outbox/domain/model/outbox-status.enum";
import { MessageEnum } from "src/hb-backend-api/outbox/domain/model/message.enum";

// ──────────────────────────────────────────────
// Test Factories
// ──────────────────────────────────────────────
const makeUserId = () => new UserId(new Types.ObjectId());
const makeNoteId = () => new NoteId(new Types.ObjectId());

const makeUser = (overrides: Partial<{ id: UserId; email: string }> = {}) =>
  UserEntitySchema.of(
    overrides.id ?? makeUserId(),
    "test-user",
    overrides.email ?? "test@email.com",
    "test-nick",
    "password",
    [],
  );

const makeNote = (
  overrides: Partial<{
    id: NoteId;
    owner: UserId;
    title: string | null;
    content: string | null;
    reminder: NoteReminder | null;
  }> = {},
) =>
  NoteEntitySchema.of(
    overrides.id ?? makeNoteId(),
    overrides.owner ?? makeUserId(),
    [],
    "title" in overrides ? overrides.title! : "테스트 노트",
    "content" in overrides ? overrides.content! : "내용입니다",
    NoteType.TEXT,
    [],
    NoteColor.fromString("#FFFFFF"),
    false,
    NoteStatus.ACTIVE,
    null,
    [],
    overrides.reminder ?? null,
    0,
  );

// ──────────────────────────────────────────────
// ProcessNoteRemindService
// ──────────────────────────────────────────────
describe("ProcessNoteRemindService", () => {
  let service: ProcessNoteRemindService;
  let noteQueryPort: jest.Mocked<NoteQueryPort>;
  let userQueryPort: jest.Mocked<UserQueryPort>;
  let outboxPersistencePort: jest.Mocked<OutboxPersistencePort>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProcessNoteRemindService,
        {
          provide: DIToken.NoteModule.NoteQueryPort,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findMinOrder: jest.fn(),
          },
        },
        {
          provide: DIToken.UserModule.UserQueryPort,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByNickname: jest.fn(),
          },
        },
        {
          provide: DIToken.OutboxModule.OutboxPersistencePort,
          useValue: { save: jest.fn() },
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb: () => Promise<void>) => cb()) },
        },
      ],
    }).compile();

    service = module.get(ProcessNoteRemindService);
    noteQueryPort = module.get(DIToken.NoteModule.NoteQueryPort);
    userQueryPort = module.get(DIToken.UserModule.UserQueryPort);
    outboxPersistencePort = module.get(
      DIToken.OutboxModule.OutboxPersistencePort,
    );
  });

  // ── invoke() branches ──────────────────────

  it("should skip processing when no users exist", async () => {
    userQueryPort.findAll.mockResolvedValue([]);

    await service.invoke();

    expect(noteQueryPort.findAll).not.toHaveBeenCalled();
    expect(outboxPersistencePort.save).not.toHaveBeenCalled();
  });

  it("should not create outbox when user exists but has no notes", async () => {
    const user = makeUser();
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([]);

    await service.invoke();

    expect(noteQueryPort.findAll).toHaveBeenCalledWith(
      user.getId,
      NoteStatus.ACTIVE,
    );
    expect(outboxPersistencePort.save).not.toHaveBeenCalled();
  });

  // ── filterDueNotes branches ────────────────

  it("should skip notes without reminder", async () => {
    const user = makeUser();
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder: null }),
    ]);

    await service.invoke();

    expect(outboxPersistencePort.save).not.toHaveBeenCalled();
  });

  it("should pass notes with reminder to isDueToday check", async () => {
    const user = makeUser();
    const reminder = NoteReminder.of(new Date("2026-01-01"), Recurrence.DAILY);
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder }),
    ]);

    await service.invoke();

    // DAILY always returns true, so outbox should be created
    expect(outboxPersistencePort.save).toHaveBeenCalledTimes(1);
  });

  // ── isDueToday switch branches ─────────────

  it("should create outbox for Recurrence.NONE when date is today", async () => {
    const user = makeUser();
    const today = new Date();
    const reminder = NoteReminder.of(today, Recurrence.NONE);
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder }),
    ]);

    await service.invoke();

    expect(outboxPersistencePort.save).toHaveBeenCalledTimes(1);
  });

  it("should NOT create outbox for Recurrence.NONE when date differs", async () => {
    const user = makeUser();
    const reminder = NoteReminder.of(new Date("2020-01-01"), Recurrence.NONE);
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder }),
    ]);

    await service.invoke();

    expect(outboxPersistencePort.save).not.toHaveBeenCalled();
  });

  it("should create outbox for Recurrence.DAILY regardless of date", async () => {
    const user = makeUser();
    const reminder = NoteReminder.of(new Date("2026-01-01"), Recurrence.DAILY);
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder }),
    ]);

    await service.invoke();

    expect(outboxPersistencePort.save).toHaveBeenCalledTimes(1);
  });

  it("should create outbox for Recurrence.WEEKLY when day of week matches", async () => {
    const user = makeUser();
    const today = new Date();
    const reminder = NoteReminder.of(today, Recurrence.WEEKLY);
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder }),
    ]);

    await service.invoke();

    expect(outboxPersistencePort.save).toHaveBeenCalledTimes(1);
  });

  it("should NOT create outbox for Recurrence.WEEKLY when day of week differs", async () => {
    const user = makeUser();
    const today = new Date();
    const differentDay = new Date(today);
    differentDay.setDate(today.getDate() + 1);
    const reminder = NoteReminder.of(differentDay, Recurrence.WEEKLY);
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder }),
    ]);

    await service.invoke();

    expect(outboxPersistencePort.save).not.toHaveBeenCalled();
  });

  it("should create outbox for Recurrence.MONTHLY when day of month matches", async () => {
    const user = makeUser();
    const today = new Date();
    const sameDay = new Date(2025, 0, today.getDate());
    const reminder = NoteReminder.of(sameDay, Recurrence.MONTHLY);
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder }),
    ]);

    await service.invoke();

    expect(outboxPersistencePort.save).toHaveBeenCalledTimes(1);
  });

  it("should NOT create outbox for Recurrence.MONTHLY when day of month differs", async () => {
    const user = makeUser();
    const today = new Date();
    const differentDate = today.getDate() === 15 ? 16 : 15;
    const reminder = NoteReminder.of(
      new Date(2025, 0, differentDate),
      Recurrence.MONTHLY,
    );
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder }),
    ]);

    await service.invoke();

    expect(outboxPersistencePort.save).not.toHaveBeenCalled();
  });

  it("should NOT create outbox for unknown recurrence (default branch)", async () => {
    const user = makeUser();
    const reminder = NoteReminder.of(new Date(), "UNKNOWN" as Recurrence);
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder }),
    ]);

    await service.invoke();

    expect(outboxPersistencePort.save).not.toHaveBeenCalled();
  });

  // ── isSameDate edge cases ──────────────────

  it("should NOT match Recurrence.NONE when same year but different month", async () => {
    const user = makeUser();
    const today = new Date();
    const sameYearDiffMonth = new Date(
      today.getFullYear(),
      today.getMonth() === 11 ? 0 : today.getMonth() + 1,
      today.getDate(),
    );
    const reminder = NoteReminder.of(sameYearDiffMonth, Recurrence.NONE);
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder }),
    ]);

    await service.invoke();

    expect(outboxPersistencePort.save).not.toHaveBeenCalled();
  });

  it("should NOT match Recurrence.NONE when same year and month but different day", async () => {
    const user = makeUser();
    const today = new Date();
    const sameMonthDiffDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() === 1 ? 2 : today.getDate() - 1,
    );
    const reminder = NoteReminder.of(sameMonthDiffDay, Recurrence.NONE);
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder }),
    ]);

    await service.invoke();

    expect(outboxPersistencePort.save).not.toHaveBeenCalled();
  });

  // ── createOutbox fallback branches ─────────

  it("should use 'Note Reminder' as title fallback when note.getTitle is null", async () => {
    const user = makeUser();
    const reminder = NoteReminder.of(new Date(), Recurrence.DAILY);
    const note = makeNote({
      owner: user.getId,
      title: null,
      reminder,
    });
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([note]);

    await service.invoke();

    expect(outboxPersistencePort.save).toHaveBeenCalledTimes(1);
    const savedEntity: CreateOutboxEntity =
      outboxPersistencePort.save.mock.calls[0][0];
    expect(savedEntity.getPayload["title"]).toBe("Note Reminder");
    expect(savedEntity.getEventType).toBe(EventType.MESSAGE);
    expect(savedEntity.getStatus).toBe(OutboxStatus.PENDING);
  });

  it("should use empty string as body fallback when note.getContent is null", async () => {
    const user = makeUser();
    const reminder = NoteReminder.of(new Date(), Recurrence.DAILY);
    const note = makeNote({
      owner: user.getId,
      content: null,
      reminder,
    });
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([note]);

    await service.invoke();

    expect(outboxPersistencePort.save).toHaveBeenCalledTimes(1);
    const savedEntity: CreateOutboxEntity =
      outboxPersistencePort.save.mock.calls[0][0];
    expect(savedEntity.getPayload["body"]).toBe("");
  });

  // ── multi-user integration ─────────────────

  it("should process multiple users and notes correctly", async () => {
    const user1 = makeUser({ email: "user1@email.com" });
    const user2 = makeUser({ email: "user2@email.com" });
    const dailyReminder = NoteReminder.of(
      new Date("2026-01-01"),
      Recurrence.DAILY,
    );

    userQueryPort.findAll.mockResolvedValue([user1, user2]);
    noteQueryPort.findAll
      .mockResolvedValueOnce([
        makeNote({ owner: user1.getId, reminder: dailyReminder }),
        makeNote({ owner: user1.getId, reminder: null }),
      ])
      .mockResolvedValueOnce([
        makeNote({ owner: user2.getId, reminder: dailyReminder }),
      ]);

    await service.invoke();

    expect(noteQueryPort.findAll).toHaveBeenCalledTimes(2);
    expect(noteQueryPort.findAll).toHaveBeenCalledWith(
      user1.getId,
      NoteStatus.ACTIVE,
    );
    expect(noteQueryPort.findAll).toHaveBeenCalledWith(
      user2.getId,
      NoteStatus.ACTIVE,
    );
    // user1: 1 due note (reminder=null filtered out), user2: 1 due note
    expect(outboxPersistencePort.save).toHaveBeenCalledTimes(2);
  });

  // ── outbox payload verification ────────────

  it("should create outbox with correct payload structure", async () => {
    const user = makeUser();
    const reminder = NoteReminder.of(new Date(), Recurrence.DAILY);
    const note = makeNote({
      owner: user.getId,
      title: "My Note",
      content: "My content",
      reminder,
    });
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([note]);

    await service.invoke();

    expect(outboxPersistencePort.save).toHaveBeenCalledTimes(1);
    const savedEntity: CreateOutboxEntity =
      outboxPersistencePort.save.mock.calls[0][0];
    expect(savedEntity.getEventType).toBe(EventType.MESSAGE);
    expect(savedEntity.getStatus).toBe(OutboxStatus.PENDING);
    expect(savedEntity.getPayload).toEqual({
      id: note.getId.toString(),
      title: "My Note",
      body: "My content",
      recipient: user.getNickname,
      senderId: user.getId.toString(),
      type: MessageEnum.PUSH_MESSAGE,
    });
  });
});
