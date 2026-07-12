import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { GetNotificationsCursorController } from "../../../../../src/hb-backend-api/notification/adapters/in/get-notifications-cursor.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { UserQueryResult } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.result";
import { NotificationQueryResult } from "../../../../../src/hb-backend-api/notification/domain/ports/out/notification-query.result";
import { NotificationId } from "../../../../../src/hb-backend-api/notification/domain/model/notification-id.vo";
import { NotificationCategory } from "../../../../../src/hb-backend-api/notification/domain/enums/notification-category.enum";
import { CursorPaginatedResponse } from "../../../../../src/shared/pagination/cursor-paginated.response";
import { TokenUserInformation } from "../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("GetNotificationsCursorController", () => {
  let controller: GetNotificationsCursorController;
  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockGetNotificationsCursorUseCase = { invoke: jest.fn() };

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
      controllers: [GetNotificationsCursorController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.NotificationModule.GetNotificationsCursorUseCase,
          useValue: mockGetNotificationsCursorUseCase,
        },
      ],
    }).compile();

    controller = module.get(GetNotificationsCursorController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  describe("findWithCursor", () => {
    it("should return CursorPaginatedResponse with mapped DTOs", async () => {
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
      const cursorResult = new CursorPaginatedResponse(
        [queryResult],
        "next-cursor-id",
        true,
      );
      mockGetNotificationsCursorUseCase.invoke.mockResolvedValue(cursorResult);

      const result = await controller.findWithCursor(userInfo, undefined, 20);

      expect(mockGetNotificationsCursorUseCase.invoke).toHaveBeenCalledWith(
        userId,
        undefined,
        20,
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(notifId.toString());
      expect(result.data[0].title).toBe("title");
      expect(result.nextCursor).toBe("next-cursor-id");
      expect(result.hasNext).toBe(true);
    });

    it("should pass cursor to use case", async () => {
      const cursorResult = new CursorPaginatedResponse([], null, false);
      mockGetNotificationsCursorUseCase.invoke.mockResolvedValue(cursorResult);

      const result = await controller.findWithCursor(
        userInfo,
        "some-cursor",
        10,
      );

      expect(mockGetNotificationsCursorUseCase.invoke).toHaveBeenCalledWith(
        userId,
        "some-cursor",
        10,
      );
      expect(result.data).toEqual([]);
      expect(result.hasNext).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it("should propagate use case error", async () => {
      mockGetNotificationsCursorUseCase.invoke.mockRejectedValue(
        new Error("db error"),
      );

      await expect(
        controller.findWithCursor(userInfo, undefined, 20),
      ).rejects.toThrow("db error");
    });
  });
});
