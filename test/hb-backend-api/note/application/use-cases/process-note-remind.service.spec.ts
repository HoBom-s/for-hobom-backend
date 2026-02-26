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
    overrides.title ?? "테스트 노트",
    overrides.content ?? "내용입니다",
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

  it("should skip processing when no users exist", async () => {
    userQueryPort.findAll.mockResolvedValue([]);

    await service.invoke();

    expect(noteQueryPort.findAll).not.toHaveBeenCalled();
    expect(outboxPersistencePort.save).not.toHaveBeenCalled();
  });

  it("should skip notes without reminder", async () => {
    const user = makeUser();
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder: null }),
    ]);

    await service.invoke();

    expect(outboxPersistencePort.save).not.toHaveBeenCalled();
  });

  it("should create outbox for DAILY recurrence notes", async () => {
    const user = makeUser();
    const reminder = NoteReminder.of(new Date("2026-01-01"), Recurrence.DAILY);
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder }),
    ]);

    await service.invoke();

    expect(outboxPersistencePort.save).toHaveBeenCalledTimes(1);
  });

  it("should create outbox for WEEKLY recurrence when day of week matches", async () => {
    const user = makeUser();
    const today = new Date();
    // 오늘과 같은 요일의 날짜를 사용
    const reminder = NoteReminder.of(today, Recurrence.WEEKLY);
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder }),
    ]);

    await service.invoke();

    expect(outboxPersistencePort.save).toHaveBeenCalledTimes(1);
  });

  it("should NOT create outbox for WEEKLY recurrence when day of week differs", async () => {
    const user = makeUser();
    const today = new Date();
    // 오늘과 다른 요일의 날짜를 생성
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

  it("should create outbox for MONTHLY recurrence when day of month matches", async () => {
    const user = makeUser();
    const today = new Date();
    // 오늘과 같은 일(date)의 날짜를 사용
    const sameDay = new Date(2025, 0, today.getDate());
    const reminder = NoteReminder.of(sameDay, Recurrence.MONTHLY);
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder }),
    ]);

    await service.invoke();

    expect(outboxPersistencePort.save).toHaveBeenCalledTimes(1);
  });

  it("should NOT create outbox for MONTHLY recurrence when day of month differs", async () => {
    const user = makeUser();
    const today = new Date();
    // 오늘과 다른 일(date)의 날짜를 생성
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

  it("should create outbox for NONE recurrence when date is today", async () => {
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

  it("should NOT create outbox for NONE recurrence when date is not today", async () => {
    const user = makeUser();
    const reminder = NoteReminder.of(new Date("2020-01-01"), Recurrence.NONE);
    userQueryPort.findAll.mockResolvedValue([user]);
    noteQueryPort.findAll.mockResolvedValue([
      makeNote({ owner: user.getId, reminder }),
    ]);

    await service.invoke();

    expect(outboxPersistencePort.save).not.toHaveBeenCalled();
  });

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
    // user1: 1 due note (reminder=null 제외), user2: 1 due note
    expect(outboxPersistencePort.save).toHaveBeenCalledTimes(2);
  });
});
