import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { ReadNotificationController } from "../../../../../src/hb-backend-api/notification/adapters/in/read-notification.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { UserQueryResult } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.result";
import { NotificationId } from "../../../../../src/hb-backend-api/notification/domain/model/notification-id.vo";
import { TokenUserInformation } from "../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("ReadNotificationController", () => {
  let controller: ReadNotificationController;
  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockReadNotificationUseCase = { invoke: jest.fn() };

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
      controllers: [ReadNotificationController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.NotificationModule.ReadNotificationUseCase,
          useValue: mockReadNotificationUseCase,
        },
      ],
    }).compile();

    controller = module.get(ReadNotificationController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  describe("markAsRead", () => {
    it("should resolve user and call readNotificationUseCase", async () => {
      const notifId = NotificationId.fromString(
        new Types.ObjectId().toHexString(),
      );
      mockReadNotificationUseCase.invoke.mockResolvedValue(undefined);

      await controller.markAsRead(userInfo, notifId);

      expect(mockReadNotificationUseCase.invoke).toHaveBeenCalledWith(
        notifId,
        userId,
      );
    });

    it("should propagate use case error", async () => {
      const notifId = NotificationId.fromString(
        new Types.ObjectId().toHexString(),
      );
      mockReadNotificationUseCase.invoke.mockRejectedValue(
        new Error("not found"),
      );

      await expect(controller.markAsRead(userInfo, notifId)).rejects.toThrow(
        "not found",
      );
    });
  });
});
