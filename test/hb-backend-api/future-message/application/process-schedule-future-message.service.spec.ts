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
import { FutureMessageDomain } from "../../../../src/hb-backend-api/future-message/domain/model/future-message.domain";
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

  it("should process due scheduled messages", async () => {
    const mockId = new FutureMessageId(new Types.ObjectId());
    const mockSenderId = new UserId(new Types.ObjectId());
    const mockRecipientId = new UserId(new Types.ObjectId());
    const now = new Date().toISOString();
    const createdAt = new Date();
    const updatedAt = new Date();
    const mockDomain = new FutureMessageDomain(
      mockId,
      mockSenderId,
      mockRecipientId,
      "Test title",
      "Test content",
      SendStatus.PENDING,
      now,
      createdAt,
      updatedAt,
    );

    jest.spyOn(mockDomain, "isDueToSend").mockReturnValue(true);
    jest.spyOn(FutureMessageDomain, "of").mockReturnValue(mockDomain);

    futureMessageQueryPort.findAllBySendStatusWithoutSenderId.mockResolvedValue(
      [
        {
          id: mockId,
          senderId: mockSenderId,
          recipientId: mockRecipientId,
          title: "Test title",
          content: "Test content",
          sendStatus: SendStatus.PENDING,
          scheduledAt: now,
          createdAt,
          updatedAt,
        } as unknown as FutureMessageQueryResult,
      ],
    );

    const user = UserEntitySchema.of(
      new UserId(new Types.ObjectId()),
      "user",
      "email",
      "nickname",
      "password",
      [new Types.ObjectId()],
    );
    userQueryPort.findById.mockResolvedValue(user);

    const saveSpy = outboxPersistencePort.save;
    const markSpy = futureMessagePersistencePort.markAsSent;

    await service.invoke();

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(markSpy).toHaveBeenCalledWith(mockId);
  });

  it("should skip processing if no due messages", async () => {
    futureMessageQueryPort.findAllBySendStatusWithoutSenderId.mockResolvedValue(
      [],
    );

    const saveSpy = outboxPersistencePort.save;
    const markSpy = futureMessagePersistencePort.markAsSent;

    await service.invoke();

    expect(saveSpy).not.toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();
  });
});
