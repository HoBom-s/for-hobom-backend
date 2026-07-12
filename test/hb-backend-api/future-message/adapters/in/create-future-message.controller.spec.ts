import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { CreateFutureMessageController } from "../../../../../src/hb-backend-api/future-message/adapters/in/create-future-message.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { UserQueryResult } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.result";
import { TokenUserInformation } from "../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("CreateFutureMessageController", () => {
  let controller: CreateFutureMessageController;
  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockCreateFutureMessageUseCase = { invoke: jest.fn() };

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
      controllers: [CreateFutureMessageController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.FutureMessageModule.CreateFutureMessageUseCase,
          useValue: mockCreateFutureMessageUseCase,
        },
      ],
    }).compile();

    controller = module.get(CreateFutureMessageController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  describe("create", () => {
    it("should resolve user and call createFutureMessageUseCase", async () => {
      const recipientId = new Types.ObjectId().toHexString();
      mockCreateFutureMessageUseCase.invoke.mockResolvedValue(undefined);

      await controller.create(userInfo, {
        recipientId,
        title: "Future greeting",
        content: "Hello from the past!",
        scheduledAt: "2026-12-25",
      });

      expect(mockGetUserByNicknameUseCase.invoke).toHaveBeenCalledTimes(1);
      expect(mockCreateFutureMessageUseCase.invoke).toHaveBeenCalledTimes(1);
    });

    it("should propagate use case error", async () => {
      mockCreateFutureMessageUseCase.invoke.mockRejectedValue(
        new Error("creation failed"),
      );

      await expect(
        controller.create(userInfo, {
          recipientId: new Types.ObjectId().toHexString(),
          title: "t",
          content: "c",
          scheduledAt: "2026-12-25",
        }),
      ).rejects.toThrow("creation failed");
    });
  });
});
