import { Test, TestingModule } from "@nestjs/testing";
import { CreateUserController } from "../../../../../src/hb-backend-api/user/adapters/in/create-user.controller";
import { CreateUserUseCase } from "../../../../../src/hb-backend-api/user/domain/ports/in/create-user.use-case";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { ThrottlerGuard } from "@nestjs/throttler";

describe("CreateUserController", () => {
  let controller: CreateUserController;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateUserController],
      providers: [
        {
          provide: DIToken.UserModule.CreateUserUseCase,
          useValue: { invoke: jest.fn() },
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(CreateUserController);
    createUserUseCase = module.get(DIToken.UserModule.CreateUserUseCase);
  });

  it("should call createUserUseCase with correct command", async () => {
    createUserUseCase.invoke.mockResolvedValue(undefined);

    const body = {
      username: "testuser",
      nickname: "testnick",
      email: "test@email.com",
      password: "Password1!",
    };

    await controller.createUser(body);

    expect(createUserUseCase.invoke).toHaveBeenCalledTimes(1);
    const command = createUserUseCase.invoke.mock.calls[0][0];
    expect(command.getUsername).toBe("testuser");
    expect(command.getNickname).toBe("testnick");
    expect(command.getEmail).toBe("test@email.com");
    expect(command.getPassword).toBe("Password1!");
  });
});
