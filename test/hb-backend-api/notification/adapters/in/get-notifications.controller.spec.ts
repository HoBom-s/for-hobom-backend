import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { GetNotificationsController } from "../../../../../src/hb-backend-api/notification/adapters/in/get-notifications.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { UserQueryResult } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.result";
import { NotificationQueryResult } from "../../../../../src/hb-backend-api/notification/domain/ports/out/notification-query.result";
import { NotificationId } from "../../../../../src/hb-backend-api/notification/domain/model/notification-id.vo";
import { NotificationCategory } from "../../../../../src/hb-backend-api/notification/domain/enums/notification-category.enum";
import { TokenUserInformation } from "../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("GetNotificationsController", () => {
  let controller: GetNotificationsController;
  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockGetAllNotificationsUseCase = { invoke: jest.fn() };

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
      controllers: [GetNotificationsController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.NotificationModule.GetAllNotificationsUseCase,
          useValue: mockGetAllNotificationsUseCase,
        },
      ],
    }).compile();

    controller = module.get(GetNotificationsController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  describe("findAll", () => {
    it("should return mapped NotificationResponseDto array", async () => {
      const notifId = NotificationId.fromString(
        new Types.ObjectId().toHexString(),
      );
      const createdAt = new Date();
      const queryResult = new NotificationQueryResult(
        notifId,
        NotificationCategory.SYSTEM,
        userId,
        "title",
        "body",
        "sender-1",
        false,
        createdAt,
      );
      mockGetAllNotificationsUseCase.invoke.mockResolvedValue([queryResult]);

      const result = await controller.findAll(userInfo);

      expect(mockGetAllNotificationsUseCase.invoke).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(notifId.toString());
      expect(result[0].category).toBe(NotificationCategory.SYSTEM);
      expect(result[0].title).toBe("title");
      expect(result[0].body).toBe("body");
      expect(result[0].senderId).toBe("sender-1");
      expect(result[0].isRead).toBe(false);
      expect(result[0].createdAt).toBe(createdAt);
    });

    it("should return empty array when no notifications", async () => {
      mockGetAllNotificationsUseCase.invoke.mockResolvedValue([]);

      const result = await controller.findAll(userInfo);

      expect(result).toEqual([]);
    });

    it("should propagate use case error", async () => {
      mockGetAllNotificationsUseCase.invoke.mockRejectedValue(
        new Error("db error"),
      );

      await expect(controller.findAll(userInfo)).rejects.toThrow("db error");
    });
  });
});
