import { Test, TestingModule } from "@nestjs/testing";
import { ProcessScheduleFutureMessageService } from "../../../../src/hb-backend-api/future-message/application/use-cases/process-schedule-future-message.service";
import { FutureMessageQueryPort } from "../../../../src/hb-backend-api/future-message/domain/ports/out/future-message-query.port";
import { FutureMessagePersistencePort } from "../../../../src/hb-backend-api/future-message/domain/ports/out/future-message-persistence.port";
import { OutboxPersistencePort } from "../../../../src/hb-backend-api/outbox/domain/ports/out/outbox-persistence.port";
import { UserQueryPort } from "../../../../src/hb-backend-api/user/domain/ports/out/user-query.port";
import { DIToken } from "../../../../src/shared/di/token.di";
import { TransactionRunner } from "../../../../src/infra/mongo/transaction/transaction.runner";
import { FutureMessageId } from "../../../../src/hb-backend-api/future-message/domain/model/future-message-id.vo";
import { UserId } from "../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { SendStatus } from "../../../../src/hb-backend-api/future-message/domain/model/send-status.enum";
import { FutureMessageQueryResult } from "../../../../src/hb-backend-api/future-message/domain/ports/out/future-message-query.result";
import { UserEntitySchema } from "../../../../src/hb-backend-api/user/domain/model/user.entity";
import { Types } from "mongoose";

describe("ProcessScheduleFutureMessageService", () => {
  let service: ProcessScheduleFutureMessageService;
  let futureMessageQueryPort: jest.Mocked<FutureMessageQueryPort>;
  let futureMessagePersistencePort: jest.Mocked<FutureMessagePersistencePort>;
  let outboxPersistencePort: jest.Mocked<OutboxPersistencePort>;
  let userQueryPort: jest.Mocked<UserQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessScheduleFutureMessageService,
        {
          provide: DIToken.FutureMessageModule.FutureMessageQueryPort,
          useValue: { findAllBySendStatusWithoutSenderId: jest.fn() },
        },
        {
          provide: DIToken.FutureMessageModule.FutureMessagePersistencePort,
          useValue: { markAsSent: jest.fn() },
        },
        {
          provide: DIToken.OutboxModule.OutboxPersistencePort,
          useValue: { save: jest.fn() },
        },
        {
          provide: DIToken.UserModule.UserQueryPort,
          useValue: { findById: jest.fn() },
        },
        {
          provide: TransactionRunner,
          useValue: {
            run: jest.fn((callback) => callback()),
          },
        },
      ],
    }).compile();

    service = module.get(ProcessScheduleFutureMessageService);
    futureMessageQueryPort = module.get(
      DIToken.FutureMessageModule.FutureMessageQueryPort,
    );
    futureMessagePersistencePort = module.get(
      DIToken.FutureMessageModule.FutureMessagePersistencePort,
    );
    outboxPersistencePort = module.get(
      DIToken.OutboxModule.OutboxPersistencePort,
    );
    userQueryPort = module.get(DIToken.UserModule.UserQueryPort);
  });

  it("should process due scheduled messages and verify outbox payload", async () => {
    const mockId = new FutureMessageId(new Types.ObjectId());
    const mockSenderId = new UserId(new Types.ObjectId());
    const mockRecipientId = new UserId(new Types.ObjectId());
    const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString();
    const createdAt = new Date();
    const updatedAt = new Date();

    const queryResult = new FutureMessageQueryResult(
      mockId,
      mockSenderId,
      mockRecipientId,
      "생일 축하해",
      "생일 축하한다 친구야!",
      SendStatus.PENDING,
      pastDate,
      createdAt,
      updatedAt,
    );

    futureMessageQueryPort.findAllBySendStatusWithoutSenderId.mockResolvedValue(
      [queryResult],
    );

    const recipientUser = UserEntitySchema.of(
      mockRecipientId,
      "recipient-user",
      "recipient@email.com",
      "recipient-nick",
      "password",
      [],
    );
    userQueryPort.findById.mockResolvedValue(recipientUser);

    await service.invoke();

    expect(outboxPersistencePort.save).toHaveBeenCalledTimes(1);
    expect(futureMessagePersistencePort.markAsSent).toHaveBeenCalledWith(
      mockId,
    );

    // outbox payload 내용 검증
    const savedOutbox = outboxPersistencePort.save.mock.calls[0][0];
    expect(savedOutbox.getPayload).toEqual(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        title: expect.stringContaining("생일 축하해"),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        body: expect.stringContaining("생일 축하한다 친구야!"),
        recipient: "recipient@email.com",
        senderId: mockSenderId.toString(),
      }),
    );

    // recipient 유저 조회 시 recipientId로 조회하는지 확인
    expect(userQueryPort.findById).toHaveBeenCalledWith(mockRecipientId);
  });

  it("should use distinct senderId and recipientId", () => {
    const mockId = new FutureMessageId(new Types.ObjectId());
    const mockSenderId = new UserId(new Types.ObjectId());
    const mockRecipientId = new UserId(new Types.ObjectId());
    const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString();
    const createdAt = new Date();
    const updatedAt = new Date();

    const queryResult = new FutureMessageQueryResult(
      mockId,
      mockSenderId,
      mockRecipientId,
      "제목",
      "내용",
      SendStatus.PENDING,
      pastDate,
      createdAt,
      updatedAt,
    );

    // senderId와 recipientId가 구분되는지 검증
    expect(queryResult.getSenderId).toBe(mockSenderId);
    expect(queryResult.getRecipientId).toBe(mockRecipientId);
    expect(queryResult.getSenderId).not.toBe(queryResult.getRecipientId);
  });

  it("should skip processing if no due messages", async () => {
    futureMessageQueryPort.findAllBySendStatusWithoutSenderId.mockResolvedValue(
      [],
    );

    await service.invoke();

    expect(outboxPersistencePort.save).not.toHaveBeenCalled();
    expect(futureMessagePersistencePort.markAsSent).not.toHaveBeenCalled();
  });
});
