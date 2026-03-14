import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { FindAllFutureMessageByStatusController } from "../../../../../src/hb-backend-api/future-message/adapters/in/find-all-future-message-by-status.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { UserQueryResult } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.result";
import { FutureMessageId } from "../../../../../src/hb-backend-api/future-message/domain/model/future-message-id.vo";
import { FutureMessageQueryResult } from "../../../../../src/hb-backend-api/future-message/domain/ports/out/future-message-query.result";
import { SendStatus } from "../../../../../src/hb-backend-api/future-message/domain/model/send-status.enum";
import { TokenUserInformation } from "../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("FindAllFutureMessageByStatusController", () => {
  let controller: FindAllFutureMessageByStatusController;
  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockFindAllFutureMessageByStatusUseCase = { invoke: jest.fn() };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
  const recipientId = UserId.fromString(new Types.ObjectId().toHexString());
  const mockUser = new UserQueryResult(
    userId,
    "testuser",
    "test@test.com",
    "Robin",
    [],
  );
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
  } as TokenUserInformation;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FindAllFutureMessageByStatusController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide:
            DIToken.FutureMessageModule.FindAllFutureMessageByStatusUseCase,
          useValue: mockFindAllFutureMessageByStatusUseCase,
        },
      ],
    }).compile();

    controller = module.get(FindAllFutureMessageByStatusController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  describe("findAll", () => {
    it("should return mapped FindFutureMessageDto array", async () => {
      const msgId = FutureMessageId.fromString(
        new Types.ObjectId().toHexString(),
      );
      const now = new Date();
      const queryResult = new FutureMessageQueryResult(
        msgId,
        userId,
        recipientId,
        "Future greeting",
        "Hello!",
        SendStatus.PENDING,
        "2026-12-25",
        now,
        now,
      );
      mockFindAllFutureMessageByStatusUseCase.invoke.mockResolvedValue([
        queryResult,
      ]);

      const result = await controller.findAll(userInfo, SendStatus.PENDING);

      expect(
        mockFindAllFutureMessageByStatusUseCase.invoke,
      ).toHaveBeenCalledWith(SendStatus.PENDING, userId);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(msgId.toString());
      expect(result[0].title).toBe("Future greeting");
      expect(result[0].content).toBe("Hello!");
      expect(result[0].sendStatus).toBe(SendStatus.PENDING);
      expect(result[0].scheduledAt).toBe("2026-12-25");
    });

    it("should return empty array when no messages", async () => {
      mockFindAllFutureMessageByStatusUseCase.invoke.mockResolvedValue([]);

      const result = await controller.findAll(userInfo, SendStatus.SENT);

      expect(result).toEqual([]);
    });

    it("should propagate use case error", async () => {
      mockFindAllFutureMessageByStatusUseCase.invoke.mockRejectedValue(
        new Error("db error"),
      );

      await expect(
        controller.findAll(userInfo, SendStatus.PENDING),
      ).rejects.toThrow("db error");
    });
  });
});
