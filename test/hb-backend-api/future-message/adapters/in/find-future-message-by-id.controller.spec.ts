import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { FindFutureMessageByIdController } from "../../../../../src/hb-backend-api/future-message/adapters/in/find-future-message-by-id.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { FutureMessageId } from "../../../../../src/hb-backend-api/future-message/domain/model/future-message-id.vo";
import { FutureMessageQueryResult } from "../../../../../src/hb-backend-api/future-message/domain/ports/out/future-message-query.result";
import { SendStatus } from "../../../../../src/hb-backend-api/future-message/domain/model/send-status.enum";

describe("FindFutureMessageByIdController", () => {
  let controller: FindFutureMessageByIdController;
  const mockFindFutureMessageByIdUseCase = { invoke: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FindFutureMessageByIdController],
      providers: [
        {
          provide: DIToken.FutureMessageModule.FindFutureMessageByIdUseCase,
          useValue: mockFindFutureMessageByIdUseCase,
        },
      ],
    }).compile();

    controller = module.get(FindFutureMessageByIdController);
  });

  describe("findById", () => {
    it("should return mapped FindFutureMessageDto", async () => {
      const msgId = FutureMessageId.fromString(
        new Types.ObjectId().toHexString(),
      );
      const senderId = UserId.fromString(new Types.ObjectId().toHexString());
      const recipientId = UserId.fromString(new Types.ObjectId().toHexString());
      const now = new Date();
      const queryResult = new FutureMessageQueryResult(
        msgId,
        senderId,
        recipientId,
        "Birthday note",
        "Happy birthday!",
        SendStatus.PENDING,
        "2026-06-15",
        now,
        now,
      );
      mockFindFutureMessageByIdUseCase.invoke.mockResolvedValue(queryResult);

      const result = await controller.findById(msgId);

      expect(mockFindFutureMessageByIdUseCase.invoke).toHaveBeenCalledWith(
        msgId,
      );
      expect(result.id).toBe(msgId.toString());
      expect(result.title).toBe("Birthday note");
      expect(result.content).toBe("Happy birthday!");
      expect(result.sendStatus).toBe(SendStatus.PENDING);
      expect(result.scheduledAt).toBe("2026-06-15");
      expect(result.createdAt).toBe(now);
      expect(result.updatedAt).toBe(now);
    });

    it("should propagate not found error", async () => {
      const msgId = FutureMessageId.fromString(
        new Types.ObjectId().toHexString(),
      );
      mockFindFutureMessageByIdUseCase.invoke.mockRejectedValue(
        new Error("not found"),
      );

      await expect(controller.findById(msgId)).rejects.toThrow("not found");
    });
  });
});
