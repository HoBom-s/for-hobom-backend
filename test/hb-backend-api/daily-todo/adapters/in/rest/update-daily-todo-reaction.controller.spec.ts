import { Test, TestingModule } from "@nestjs/testing";
import { UpdateDailyTodoReactionController } from "../../../../../../src/hb-backend-api/daily-todo/adapters/in/rest/update-daily-todo-reaction.controller";
import { DIToken } from "../../../../../../src/shared/di/token.di";
import { UserId } from "../../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { DailyTodoId } from "../../../../../../src/hb-backend-api/daily-todo/domain/vo/daily-todo-id.vo";
import { Types } from "mongoose";
import { TokenUserInformation } from "../../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("UpdateDailyTodoReactionController", () => {
  let controller: UpdateDailyTodoReactionController;

  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockUpdateReactionUseCase = { invoke: jest.fn() };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
  const mockUser = { getId: userId };
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
    accessToken: "token-123",
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateDailyTodoReactionController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.DailyTodoModule.UpdateDailyTodoReactionUseCase,
          useValue: mockUpdateReactionUseCase,
        },
      ],
    }).compile();

    controller = module.get(UpdateDailyTodoReactionController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  it("should call use case with id, userId, and reaction command", async () => {
    const todoId = DailyTodoId.fromString(new Types.ObjectId().toHexString());
    const reactionUserId = new Types.ObjectId().toHexString();
    mockUpdateReactionUseCase.invoke.mockResolvedValue(undefined);

    await controller.updateReaction(userInfo, todoId, {
      reaction: "thumbs_up",
      reactionUserId,
    });

    expect(mockUpdateReactionUseCase.invoke).toHaveBeenCalledTimes(1);
    const [id, uid, command] = mockUpdateReactionUseCase.invoke.mock.calls[0];
    expect(id).toBe(todoId);
    expect(uid).toBe(userId);
    expect(command.getReaction.getValue).toBe("thumbs_up");
    expect(command.getReaction.getReactionUserId.toString()).toBe(
      reactionUserId,
    );
  });

  it("should propagate use case error", async () => {
    const todoId = DailyTodoId.fromString(new Types.ObjectId().toHexString());
    mockUpdateReactionUseCase.invoke.mockRejectedValue(new Error("fail"));

    await expect(
      controller.updateReaction(userInfo, todoId, {
        reaction: "heart",
        reactionUserId: new Types.ObjectId().toHexString(),
      }),
    ).rejects.toThrow("fail");
  });
});
