import { Test, TestingModule } from "@nestjs/testing";
import { GetUserByIdController } from "../../../../../src/hb-backend-api/user/adapters/in/get-user-by-id.controller";
import { GetUserUseCase } from "../../../../../src/hb-backend-api/user/domain/ports/in/get-user.use-case";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserQueryResult } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.result";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { Types } from "mongoose";

describe("GetUserByIdController", () => {
  let controller: GetUserByIdController;
  let getUserUseCase: jest.Mocked<GetUserUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetUserByIdController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserUseCase,
          useValue: { invoke: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(GetUserByIdController);
    getUserUseCase = module.get(DIToken.UserModule.GetUserUseCase);
  });

  it("should return mapped GetUserDto for given UserId", async () => {
    const userId = new UserId(new Types.ObjectId());
    const friendId = new Types.ObjectId();
    const mockResult = new UserQueryResult(
      userId,
      "testuser",
      "test@email.com",
      "testnick",
      [friendId],
    );
    getUserUseCase.invoke.mockResolvedValue(mockResult);

    const result = await controller.findById(userId);

    expect(getUserUseCase.invoke).toHaveBeenCalledTimes(1);
    expect(getUserUseCase.invoke).toHaveBeenCalledWith(userId);
    expect(result.id).toBe(userId.toString());
    expect(result.username).toBe("testuser");
    expect(result.email).toBe("test@email.com");
    expect(result.nickname).toBe("testnick");
    expect(result.friends).toEqual([friendId]);
  });
});
