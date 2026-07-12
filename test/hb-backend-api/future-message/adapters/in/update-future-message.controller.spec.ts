import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { UpdateFutureMessageController } from "../../../../../src/hb-backend-api/future-message/adapters/in/update-future-message.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { UserQueryResult } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.result";
import { FutureMessageId } from "../../../../../src/hb-backend-api/future-message/domain/model/future-message-id.vo";
import { TokenUserInformation } from "../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("UpdateFutureMessageController", () => {
  let controller: UpdateFutureMessageController;
  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockUpdateFutureMessageUseCase = { invoke: jest.fn() };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
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
      controllers: [UpdateFutureMessageController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.FutureMessageModule.UpdateFutureMessageUseCase,
          useValue: mockUpdateFutureMessageUseCase,
        },
      ],
    }).compile();

    controller = module.get(UpdateFutureMessageController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  describe("update", () => {
    it("should resolve user and call updateFutureMessageUseCase with command", async () => {
      const msgId = FutureMessageId.fromString(
        new Types.ObjectId().toHexString(),
      );
      mockUpdateFutureMessageUseCase.invoke.mockResolvedValue(undefined);

      await controller.update(userInfo, msgId, {
        title: "Updated title",
        content: "Updated content",
        scheduledAt: "2026-12-31",
      });

      expect(mockUpdateFutureMessageUseCase.invoke).toHaveBeenCalledTimes(1);
      const [passedId, passedUserId, command] = mockUpdateFutureMessageUseCase
        .invoke.mock.calls[0] as [
        unknown,
        unknown,
        {
          getTitle: string | undefined;
          getContent: string | undefined;
          getScheduledAt: string | undefined;
        },
      ];
      expect(passedId).toBe(msgId);
      expect(passedUserId).toBe(userId);
      expect(command.getTitle).toBe("Updated title");
      expect(command.getContent).toBe("Updated content");
      expect(command.getScheduledAt).toBe("2026-12-31");
    });

    it("should handle partial update with only title", async () => {
      const msgId = FutureMessageId.fromString(
        new Types.ObjectId().toHexString(),
      );
      mockUpdateFutureMessageUseCase.invoke.mockResolvedValue(undefined);

      await controller.update(userInfo, msgId, { title: "New title" });

      const command = mockUpdateFutureMessageUseCase.invoke.mock
        .calls[0][2] as {
        getTitle: string | undefined;
        getContent: string | undefined;
        getScheduledAt: string | undefined;
      };
      expect(command.getTitle).toBe("New title");
      expect(command.getContent).toBeUndefined();
      expect(command.getScheduledAt).toBeUndefined();
    });

    it("should propagate use case error", async () => {
      const msgId = FutureMessageId.fromString(
        new Types.ObjectId().toHexString(),
      );
      mockUpdateFutureMessageUseCase.invoke.mockRejectedValue(
        new Error("forbidden"),
      );

      await expect(
        controller.update(userInfo, msgId, { title: "x" }),
      ).rejects.toThrow("forbidden");
    });
  });
});
