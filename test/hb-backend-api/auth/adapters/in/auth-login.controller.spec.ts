import { Test, TestingModule } from "@nestjs/testing";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthLoginController } from "../../../../../src/hb-backend-api/auth/adapters/in/auth-login.controller";
import { LoginAuthUseCase } from "../../../../../src/hb-backend-api/auth/domain/ports/in/login-auth.use-case";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { LoginAuthResult } from "../../../../../src/hb-backend-api/auth/domain/ports/out/login-auth.result";

describe("AuthLoginController", () => {
  let controller: AuthLoginController;
  let loginAuthUseCase: jest.Mocked<LoginAuthUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 10 }] }),
      ],
      controllers: [AuthLoginController],
      providers: [
        {
          provide: DIToken.AuthModule.LoginAuthUseCase,
          useValue: { invoke: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(AuthLoginController);
    loginAuthUseCase = module.get(DIToken.AuthModule.LoginAuthUseCase);
  });

  it("should call use case with correct command and return tokens", async () => {
    const mockResult = LoginAuthResult.of(
      "access-token-123",
      "refresh-token-456",
    );
    loginAuthUseCase.invoke.mockResolvedValue(mockResult);

    const result = await controller.login({
      nickname: "Robin",
      password: "Password1!",
    });

    expect(loginAuthUseCase.invoke).toHaveBeenCalledTimes(1);
    const command = loginAuthUseCase.invoke.mock.calls[0][0];
    expect(command.getNickname).toBe("Robin");
    expect(command.getPassword).toBe("Password1!");

    expect(result.accessToken).toBe("access-token-123");
    expect(result.refreshToken).toBe("refresh-token-456");
  });
});
