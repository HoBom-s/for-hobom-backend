import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { CreateNotificationController } from "../../../../../src/hb-backend-api/notification/adapters/in/create-notification.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { UserQueryResult } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.result";
import { NotificationCategory } from "../../../../../src/hb-backend-api/notification/domain/enums/notification-category.enum";

describe("CreateNotificationController", () => {
  let controller: CreateNotificationController;
  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockCreateNotificationUseCase = { invoke: jest.fn() };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
  const mockUser = new UserQueryResult(
    userId,
    "testuser",
    "test@test.com",
    "Robin",
    [],
  );

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateNotificationController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.NotificationModule.CreateNotificationUseCase,
          useValue: mockCreateNotificationUseCase,
        },
      ],
    }).compile();

    controller = module.get(CreateNotificationController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  describe("create", () => {
    it("should resolve recipient user and call createNotificationUseCase with SYSTEM category default", async () => {
      mockCreateNotificationUseCase.invoke.mockResolvedValue(undefined);

      await controller.create({
        recipient: "Robin",
        title: "Welcome",
        body: "Hello!",
        senderId: "system",
      });

      expect(mockGetUserByNicknameUseCase.invoke).toHaveBeenCalledTimes(1);
      expect(mockCreateNotificationUseCase.invoke).toHaveBeenCalledTimes(1);
      const command = mockCreateNotificationUseCase.invoke.mock.calls[0][0];
      expect(command.getCategory).toBe(NotificationCategory.SYSTEM);
      expect(command.getOwner.toString()).toBe(userId.toString());
      expect(command.getTitle).toBe("Welcome");
      expect(command.getBody).toBe("Hello!");
      expect(command.getSenderId).toBe("system");
      expect(command.getRecipient).toBe("Robin");
    });

    it("should pass explicit category when provided", async () => {
      mockCreateNotificationUseCase.invoke.mockResolvedValue(undefined);

      await controller.create({
        category: NotificationCategory.SYSTEM,
        recipient: "Robin",
        title: "Alert",
        body: "Something happened",
        senderId: "admin",
      });

      const command = mockCreateNotificationUseCase.invoke.mock.calls[0][0];
      expect(command.getCategory).toBe(NotificationCategory.SYSTEM);
    });

    it("should propagate use case error", async () => {
      mockCreateNotificationUseCase.invoke.mockRejectedValue(
        new Error("creation failed"),
      );

      await expect(
        controller.create({
          recipient: "Robin",
          title: "t",
          body: "b",
          senderId: "s",
        }),
      ).rejects.toThrow("creation failed");
    });
  });
});
