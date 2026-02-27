import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { BadRequestException } from "@nestjs/common";
import { CreateFutureMessageService } from "../../../../src/hb-backend-api/future-message/application/use-cases/create-future-message.service";
import { FindAllFutureMessageByStatusService } from "../../../../src/hb-backend-api/future-message/application/use-cases/find-all-future-message-by-status.service";
import { FindFutureMessageByIdService } from "../../../../src/hb-backend-api/future-message/application/use-cases/find-future-message-by-id.service";
import { UpdateFutureMessageService } from "../../../../src/hb-backend-api/future-message/application/use-cases/update-future-message.service";
import { DeleteFutureMessageService } from "../../../../src/hb-backend-api/future-message/application/use-cases/delete-future-message.service";
import { FutureMessagePersistencePort } from "../../../../src/hb-backend-api/future-message/domain/ports/out/future-message-persistence.port";
import { FutureMessageQueryPort } from "../../../../src/hb-backend-api/future-message/domain/ports/out/future-message-query.port";
import { DIToken } from "../../../../src/shared/di/token.di";
import { TransactionRunner } from "../../../../src/infra/mongo/transaction/transaction.runner";
import { UserId } from "../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { FutureMessageId } from "../../../../src/hb-backend-api/future-message/domain/model/future-message-id.vo";
import { SendStatus } from "../../../../src/hb-backend-api/future-message/domain/model/send-status.enum";
import { FutureMessageDomain } from "../../../../src/hb-backend-api/future-message/domain/model/future-message.domain";
import { FutureMessageQueryResult } from "../../../../src/hb-backend-api/future-message/domain/ports/out/future-message-query.result";
import { CreateFutureMessageCommand } from "../../../../src/hb-backend-api/future-message/domain/ports/out/create-future-message.command";
import { UpdateFutureMessageCommand } from "../../../../src/hb-backend-api/future-message/domain/ports/out/update-future-message.command";

// ──────────────────────────────────────────────
// Test Factories
// ──────────────────────────────────────────────
const makeSenderId = () => new UserId(new Types.ObjectId());
const makeRecipientId = () => new UserId(new Types.ObjectId());
const makeMessageId = () => new FutureMessageId(new Types.ObjectId());

const makeDomain = (
  id = makeMessageId(),
  senderId = makeSenderId(),
  recipientId = makeRecipientId(),
  status = SendStatus.PENDING,
) =>
  FutureMessageDomain.of(
    id,
    senderId,
    recipientId,
    "미래 메시지",
    "내용입니다",
    status,
    "2026-12-25T09:00:00.000Z",
    new Date("2026-02-27"),
    new Date("2026-02-27"),
  );

const makeQueryResult = (
  id = makeMessageId(),
  senderId = makeSenderId(),
  recipientId = makeRecipientId(),
) => FutureMessageQueryResult.from(makeDomain(id, senderId, recipientId));

const mockPersistencePort = (): jest.Mocked<FutureMessagePersistencePort> => ({
  load: jest.fn(),
  save: jest.fn(),
  markAsSent: jest.fn(),
  update: jest.fn(),
  deleteOne: jest.fn(),
});

const mockQueryPort = (): jest.Mocked<FutureMessageQueryPort> => ({
  findAllBySendStatusWithoutSenderId: jest.fn(),
  findAllBySendStatus: jest.fn(),
  findById: jest.fn(),
});

// ──────────────────────────────────────────────
// CreateFutureMessageService
// ──────────────────────────────────────────────
describe("CreateFutureMessageService", () => {
  let service: CreateFutureMessageService;
  let persistencePort: jest.Mocked<FutureMessagePersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateFutureMessageService,
        {
          provide: DIToken.FutureMessageModule.FutureMessagePersistencePort,
          useValue: mockPersistencePort(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(CreateFutureMessageService);
    persistencePort = module.get(
      DIToken.FutureMessageModule.FutureMessagePersistencePort,
    );
  });

  it("미래 메시지를 생성해야 한다", async () => {
    persistencePort.save.mockResolvedValue(undefined);

    const command = new CreateFutureMessageCommand(
      makeSenderId(),
      makeRecipientId(),
      "생일 축하해",
      "생일 축하합니다!",
      SendStatus.PENDING,
      "2026-12-25T09:00:00.000Z",
    );

    await service.invoke(command);

    expect(persistencePort.save).toHaveBeenCalledTimes(1);
  });
});

// ──────────────────────────────────────────────
// FindAllFutureMessageByStatusService
// ──────────────────────────────────────────────
describe("FindAllFutureMessageByStatusService", () => {
  let service: FindAllFutureMessageByStatusService;
  let queryPort: jest.Mocked<FutureMessageQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllFutureMessageByStatusService,
        {
          provide: DIToken.FutureMessageModule.FutureMessageQueryPort,
          useValue: mockQueryPort(),
        },
      ],
    }).compile();

    service = module.get(FindAllFutureMessageByStatusService);
    queryPort = module.get(DIToken.FutureMessageModule.FutureMessageQueryPort);
  });

  it("상태별 메시지 목록을 반환해야 한다", async () => {
    const senderId = makeSenderId();
    queryPort.findAllBySendStatus.mockResolvedValue([
      makeQueryResult(),
      makeQueryResult(),
    ]);

    const result = await service.invoke(SendStatus.PENDING, senderId);

    expect(queryPort.findAllBySendStatus).toHaveBeenCalledWith(
      SendStatus.PENDING,
      senderId,
    );
    expect(result).toHaveLength(2);
  });
});

// ──────────────────────────────────────────────
// FindFutureMessageByIdService
// ──────────────────────────────────────────────
describe("FindFutureMessageByIdService", () => {
  let service: FindFutureMessageByIdService;
  let queryPort: jest.Mocked<FutureMessageQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindFutureMessageByIdService,
        {
          provide: DIToken.FutureMessageModule.FutureMessageQueryPort,
          useValue: mockQueryPort(),
        },
      ],
    }).compile();

    service = module.get(FindFutureMessageByIdService);
    queryPort = module.get(DIToken.FutureMessageModule.FutureMessageQueryPort);
  });

  it("ID로 메시지를 조회해야 한다", async () => {
    const id = makeMessageId();
    const expected = makeQueryResult(id);
    queryPort.findById.mockResolvedValue(expected);

    const result = await service.invoke(id);

    expect(queryPort.findById).toHaveBeenCalledWith(id);
    expect(result.getId).toBe(id);
  });
});

// ──────────────────────────────────────────────
// UpdateFutureMessageService
// ──────────────────────────────────────────────
describe("UpdateFutureMessageService", () => {
  let service: UpdateFutureMessageService;
  let persistencePort: jest.Mocked<FutureMessagePersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateFutureMessageService,
        {
          provide: DIToken.FutureMessageModule.FutureMessagePersistencePort,
          useValue: mockPersistencePort(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(UpdateFutureMessageService);
    persistencePort = module.get(
      DIToken.FutureMessageModule.FutureMessagePersistencePort,
    );
  });

  it("PENDING 메시지를 수정해야 한다", async () => {
    const senderId = makeSenderId();
    const id = makeMessageId();
    const domain = makeDomain(id, senderId);
    persistencePort.load.mockResolvedValue(domain);
    persistencePort.update.mockResolvedValue(undefined);

    const command = UpdateFutureMessageCommand.of("수정된 제목", "수정된 내용");

    await service.invoke(id, senderId, command);

    expect(persistencePort.load).toHaveBeenCalledWith(id);
    expect(persistencePort.update).toHaveBeenCalledWith(id, {
      title: "수정된 제목",
      content: "수정된 내용",
    });
  });

  it("본인이 아닌 메시지를 수정하면 BadRequestException을 던져야 한다", async () => {
    const senderId = makeSenderId();
    const otherId = makeSenderId();
    const id = makeMessageId();
    const domain = makeDomain(id, senderId);
    persistencePort.load.mockResolvedValue(domain);

    const command = UpdateFutureMessageCommand.of("제목");

    await expect(service.invoke(id, otherId, command)).rejects.toThrow(
      BadRequestException,
    );
    expect(persistencePort.update).not.toHaveBeenCalled();
  });

  it("이미 발송된 메시지를 수정하면 BadRequestException을 던져야 한다", async () => {
    const senderId = makeSenderId();
    const id = makeMessageId();
    const domain = makeDomain(id, senderId, makeRecipientId(), SendStatus.SENT);
    persistencePort.load.mockResolvedValue(domain);

    const command = UpdateFutureMessageCommand.of("제목");

    await expect(service.invoke(id, senderId, command)).rejects.toThrow(
      BadRequestException,
    );
    expect(persistencePort.update).not.toHaveBeenCalled();
  });

  it("변경 사항이 없으면 update를 호출하지 않아야 한다", async () => {
    const senderId = makeSenderId();
    const id = makeMessageId();
    const domain = makeDomain(id, senderId);
    persistencePort.load.mockResolvedValue(domain);

    const command = UpdateFutureMessageCommand.of();

    await service.invoke(id, senderId, command);

    expect(persistencePort.update).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// DeleteFutureMessageService
// ──────────────────────────────────────────────
describe("DeleteFutureMessageService", () => {
  let service: DeleteFutureMessageService;
  let persistencePort: jest.Mocked<FutureMessagePersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteFutureMessageService,
        {
          provide: DIToken.FutureMessageModule.FutureMessagePersistencePort,
          useValue: mockPersistencePort(),
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(DeleteFutureMessageService);
    persistencePort = module.get(
      DIToken.FutureMessageModule.FutureMessagePersistencePort,
    );
  });

  it("PENDING 메시지를 삭제해야 한다", async () => {
    const senderId = makeSenderId();
    const id = makeMessageId();
    const domain = makeDomain(id, senderId);
    persistencePort.load.mockResolvedValue(domain);
    persistencePort.deleteOne.mockResolvedValue(undefined);

    await service.invoke(id, senderId);

    expect(persistencePort.load).toHaveBeenCalledWith(id);
    expect(persistencePort.deleteOne).toHaveBeenCalledWith(id);
  });

  it("본인이 아닌 메시지를 삭제하면 BadRequestException을 던져야 한다", async () => {
    const senderId = makeSenderId();
    const otherId = makeSenderId();
    const id = makeMessageId();
    const domain = makeDomain(id, senderId);
    persistencePort.load.mockResolvedValue(domain);

    await expect(service.invoke(id, otherId)).rejects.toThrow(
      BadRequestException,
    );
    expect(persistencePort.deleteOne).not.toHaveBeenCalled();
  });

  it("이미 발송된 메시지를 삭제하면 BadRequestException을 던져야 한다", async () => {
    const senderId = makeSenderId();
    const id = makeMessageId();
    const domain = makeDomain(id, senderId, makeRecipientId(), SendStatus.SENT);
    persistencePort.load.mockResolvedValue(domain);

    await expect(service.invoke(id, senderId)).rejects.toThrow(
      BadRequestException,
    );
    expect(persistencePort.deleteOne).not.toHaveBeenCalled();
  });
});
