import { Test, TestingModule } from "@nestjs/testing";
import { InternalUserController } from "../../../../../src/hb-backend-api/user/adapters/in/internal-user.controller";
import { GetUserByNicknameUseCase } from "../../../../../src/hb-backend-api/user/domain/ports/in/get-user-by-nickname.use-case";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserQueryResult } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.result";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { Types } from "mongoose";

describe("InternalUserController", () => {
  let controller: InternalUserController;
  let getUserByNicknameUseCase: jest.Mocked<GetUserByNicknameUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternalUserController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: { invoke: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(InternalUserController);
    getUserByNicknameUseCase = module.get(
      DIToken.UserModule.GetUserByNicknameUseCase,
    );
  });

  it("should return mapped GetUserDto for given nickname", async () => {
    const userId = new UserId(new Types.ObjectId());
    const mockResult = new UserQueryResult(
      userId,
      "testuser",
      "test@email.com",
      "testnick",
      [],
    );
    getUserByNicknameUseCase.invoke.mockResolvedValue(mockResult);

    const result = await controller.findById("testnick");

    expect(getUserByNicknameUseCase.invoke).toHaveBeenCalledTimes(1);
    const passedNickname = getUserByNicknameUseCase.invoke.mock.calls[0][0];
    expect(passedNickname.raw).toBe("testnick");
    expect(result.id).toBe(userId.toString());
    expect(result.username).toBe("testuser");
    expect(result.email).toBe("test@email.com");
    expect(result.nickname).toBe("testnick");
  });
});
