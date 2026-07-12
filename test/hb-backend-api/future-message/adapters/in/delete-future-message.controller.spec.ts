import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { DeleteFutureMessageController } from "../../../../../src/hb-backend-api/future-message/adapters/in/delete-future-message.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { UserQueryResult } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.result";
import { FutureMessageId } from "../../../../../src/hb-backend-api/future-message/domain/model/future-message-id.vo";
import { TokenUserInformation } from "../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("DeleteFutureMessageController", () => {
  let controller: DeleteFutureMessageController;
  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockDeleteFutureMessageUseCase = { invoke: jest.fn() };

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
      controllers: [DeleteFutureMessageController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.FutureMessageModule.DeleteFutureMessageUseCase,
          useValue: mockDeleteFutureMessageUseCase,
        },
      ],
    }).compile();

    controller = module.get(DeleteFutureMessageController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  describe("delete", () => {
    it("should resolve user and call deleteFutureMessageUseCase", async () => {
      const msgId = FutureMessageId.fromString(
        new Types.ObjectId().toHexString(),
      );
      mockDeleteFutureMessageUseCase.invoke.mockResolvedValue(undefined);

      await controller.delete(userInfo, msgId);

      expect(mockDeleteFutureMessageUseCase.invoke).toHaveBeenCalledWith(
        msgId,
        userId,
      );
    });

    it("should propagate use case error", async () => {
      const msgId = FutureMessageId.fromString(
        new Types.ObjectId().toHexString(),
      );
      mockDeleteFutureMessageUseCase.invoke.mockRejectedValue(
        new Error("not in PENDING status"),
      );

      await expect(controller.delete(userInfo, msgId)).rejects.toThrow(
        "not in PENDING status",
      );
    });
  });
});
