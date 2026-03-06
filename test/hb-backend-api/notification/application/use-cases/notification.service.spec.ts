import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { CreateNotificationService } from "../../../../../src/hb-backend-api/notification/application/use-cases/create-notification.service";
import { GetAllNotificationsService } from "../../../../../src/hb-backend-api/notification/application/use-cases/get-all-notifications.service";
import { ReadNotificationService } from "../../../../../src/hb-backend-api/notification/application/use-cases/read-notification.service";
import { NotificationPersistencePort } from "../../../../../src/hb-backend-api/notification/domain/ports/out/notification-persistence.port";
import { NotificationQueryPort } from "../../../../../src/hb-backend-api/notification/domain/ports/out/notification-query.port";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { TransactionRunner } from "../../../../../src/infra/mongo/transaction/transaction.runner";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { NotificationId } from "../../../../../src/hb-backend-api/notification/domain/model/notification-id.vo";
import { NotificationCategory } from "../../../../../src/hb-backend-api/notification/domain/enums/notification-category.enum";
import { NotificationEntitySchema } from "../../../../../src/hb-backend-api/notification/domain/model/notification.entity";
import { CreateNotificationCommand } from "../../../../../src/hb-backend-api/notification/domain/ports/out/create-notification.command";

// ──────────────────────────────────────────────
// Test Factories
// ──────────────────────────────────────────────
const makeOwnerId = () => new UserId(new Types.ObjectId());
const makeNotificationId = () => new NotificationId(new Types.ObjectId());

const makeNotificationEntity = (
  id = makeNotificationId(),
  owner = makeOwnerId(),
) =>
  NotificationEntitySchema.of(
    id,
    NotificationCategory.SYSTEM,
    owner,
    "테스트 알림",
    "알림 본문입니다",
    "system",
    false,
    new Date("2026-02-27"),
  );

const mockPersistencePort = (): jest.Mocked<NotificationPersistencePort> => ({
  save: jest.fn(),
  markAsRead: jest.fn(),
  deleteExpiredBatch: jest.fn(),
});

const mockQueryPort = (): jest.Mocked<NotificationQueryPort> => ({
  findAllByOwner: jest.fn(),
  findByOwnerWithCursor: jest.fn(),
});

// ──────────────────────────────────────────────
// CreateNotificationService
// ──────────────────────────────────────────────
describe("CreateNotificationService", () => {
  let service: CreateNotificationService;
  let persistencePort: jest.Mocked<NotificationPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateNotificationService,
        {
          provide: DIToken.NotificationModule.NotificationPersistencePort,
          useValue: mockPersistencePort(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(CreateNotificationService);
    persistencePort = module.get(
      DIToken.NotificationModule.NotificationPersistencePort,
    );
  });

  it("알림을 생성해야 한다", async () => {
    persistencePort.save.mockResolvedValue("notification-id");

    const owner = makeOwnerId();
    const command = CreateNotificationCommand.of(
      NotificationCategory.SYSTEM,
      owner,
      "새 알림",
      "알림 본문",
      "system",
      "recipient@test.com",
    );

    await service.invoke(command);

    expect(persistencePort.save).toHaveBeenCalledTimes(1);
    const saved = persistencePort.save.mock.calls[0][0];
    expect(saved.getTitle).toBe("새 알림");
    expect(saved.getCategory).toBe(NotificationCategory.SYSTEM);
  });
});

// ──────────────────────────────────────────────
// GetAllNotificationsService
// ──────────────────────────────────────────────
describe("GetAllNotificationsService", () => {
  let service: GetAllNotificationsService;
  let queryPort: jest.Mocked<NotificationQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllNotificationsService,
        {
          provide: DIToken.NotificationModule.NotificationQueryPort,
          useValue: mockQueryPort(),
        },
      ],
    }).compile();

    service = module.get(GetAllNotificationsService);
    queryPort = module.get(DIToken.NotificationModule.NotificationQueryPort);
  });

  it("알림 목록을 반환해야 한다", async () => {
    const owner = makeOwnerId();
    queryPort.findAllByOwner.mockResolvedValue([
      makeNotificationEntity(),
      makeNotificationEntity(),
    ]);

    const result = await service.invoke(owner);

    expect(queryPort.findAllByOwner).toHaveBeenCalledWith(owner);
    expect(result).toHaveLength(2);
  });

  it("알림이 없으면 빈 배열을 반환해야 한다", async () => {
    queryPort.findAllByOwner.mockResolvedValue([]);

    const result = await service.invoke(makeOwnerId());

    expect(result).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// ReadNotificationService
// ──────────────────────────────────────────────
describe("ReadNotificationService", () => {
  let service: ReadNotificationService;
  let persistencePort: jest.Mocked<NotificationPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadNotificationService,
        {
          provide: DIToken.NotificationModule.NotificationPersistencePort,
          useValue: mockPersistencePort(),
        },
      ],
    }).compile();

    service = module.get(ReadNotificationService);
    persistencePort = module.get(
      DIToken.NotificationModule.NotificationPersistencePort,
    );
  });

  it("알림을 읽음 처리해야 한다", async () => {
    persistencePort.markAsRead.mockResolvedValue(undefined);

    const notificationId = makeNotificationId();
    const owner = makeOwnerId();

    await service.invoke(notificationId, owner);

    expect(persistencePort.markAsRead).toHaveBeenCalledWith(
      notificationId,
      owner,
    );
  });
});
