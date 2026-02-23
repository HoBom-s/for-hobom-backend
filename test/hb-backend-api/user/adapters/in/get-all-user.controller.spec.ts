import { Test, TestingModule } from "@nestjs/testing";
import { GetAllUserController } from "../../../../../src/hb-backend-api/user/adapters/in/get-all-user.controller";
import { GetAllUserUseCase } from "../../../../../src/hb-backend-api/user/domain/ports/in/get-all-user.use-case";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserQueryResult } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.result";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { Types } from "mongoose";

describe("GetAllUserController", () => {
  let controller: GetAllUserController;
  let getAllUserUseCase: jest.Mocked<GetAllUserUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetAllUserController],
      providers: [
        {
          provide: DIToken.UserModule.GetAllUserUseCase,
          useValue: { invoke: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(GetAllUserController);
    getAllUserUseCase = module.get(DIToken.UserModule.GetAllUserUseCase);
  });

  it("should return mapped GetUserDto array", async () => {
    const userId = new UserId(new Types.ObjectId());
    const mockResults = [
      new UserQueryResult(userId, "user1", "user1@email.com", "nick1", []),
    ];
    getAllUserUseCase.invoke.mockResolvedValue(mockResults);

    const result = await controller.findAll();

    expect(getAllUserUseCase.invoke).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe("user1");
    expect(result[0].email).toBe("user1@email.com");
    expect(result[0].nickname).toBe("nick1");
  });

  it("should return empty array when no users", async () => {
    getAllUserUseCase.invoke.mockResolvedValue([]);

    const result = await controller.findAll();

    expect(result).toEqual([]);
  });
});
