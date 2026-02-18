import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { LoginAuthService } from "../../../../../src/hb-backend-api/auth/application/use-cases/login-auth.service";
import { UserQueryPort } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.port";
import { AuthPersistencePort } from "../../../../../src/hb-backend-api/auth/domain/ports/out/auth-persistence.port";
import { AuthQueryPort } from "../../../../../src/hb-backend-api/auth/domain/ports/out/auth-query.port";
import { JwtAuthPort } from "../../../../../src/hb-backend-api/auth/domain/ports/out/jwt-auth.port";
import { LoginAuthCommand } from "../../../../../src/hb-backend-api/auth/domain/ports/out/login-auth.command";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { TransactionRunner } from "../../../../../src/infra/mongo/transaction/transaction.runner";
import { UserEntitySchema } from "../../../../../src/hb-backend-api/user/domain/model/user.entity";
import { AuthEntitySchema } from "../../../../../src/hb-backend-api/auth/domain/model/auth.entity";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { Types } from "mongoose";

jest.mock("bcrypt");

describe("LoginAuthService", () => {
  let service: LoginAuthService;
  let userQueryPort: jest.Mocked<UserQueryPort>;
  let authPersistencePort: jest.Mocked<AuthPersistencePort>;
  let authQueryPort: jest.Mocked<AuthQueryPort>;
  let jwtAuthPort: jest.Mocked<JwtAuthPort>;

  const mockUser = UserEntitySchema.of(
    new UserId(new Types.ObjectId()),
    "Robin Yeon",
    "robin@hobom.com",
    "Robin",
    "hashedPassword",
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginAuthService,
        {
          provide: DIToken.UserModule.UserQueryPort,
          useValue: { findByNickname: jest.fn() },
        },
        {
          provide: DIToken.AuthModule.AuthPersistencePort,
          useValue: { saveRefreshToken: jest.fn() },
        },
        {
          provide: DIToken.AuthModule.AuthQueryPort,
          useValue: { findByNickname: jest.fn() },
        },
        {
          provide: DIToken.AuthModule.JwtAuthPort,
          useValue: {
            signAccessToken: jest.fn(),
            signRefreshToken: jest.fn(),
          },
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue("30d") },
        },
      ],
    }).compile();

    service = module.get(LoginAuthService);
    userQueryPort = module.get(DIToken.UserModule.UserQueryPort);
    authPersistencePort = module.get(DIToken.AuthModule.AuthPersistencePort);
    authQueryPort = module.get(DIToken.AuthModule.AuthQueryPort);
    jwtAuthPort = module.get(DIToken.AuthModule.JwtAuthPort);
  });

  describe("invoke()", () => {
    it("should return access and refresh tokens on successful login", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userQueryPort.findByNickname.mockResolvedValue(mockUser);
      authQueryPort.findByNickname.mockResolvedValue(null);
      jwtAuthPort.signAccessToken.mockReturnValue("access-token");
      jwtAuthPort.signRefreshToken.mockReturnValue("refresh-token");
      authPersistencePort.saveRefreshToken.mockResolvedValue(undefined);

      const command = LoginAuthCommand.of("Robin", "Password1!");
      const result = await service.invoke(command);

      expect(result.getAccessToken).toBe("access-token");
      expect(result.getRefreshToken).toBe("refresh-token");
    });

    it("should reuse existing valid refresh token", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userQueryPort.findByNickname.mockResolvedValue(mockUser);

      const futureExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24);
      const existingAuth = AuthEntitySchema.of(
        "Robin",
        "existing-refresh-token",
        futureExpiry,
      );
      authQueryPort.findByNickname.mockResolvedValue(existingAuth);
      jwtAuthPort.signAccessToken.mockReturnValue("new-access-token");

      const command = LoginAuthCommand.of("Robin", "Password1!");
      const result = await service.invoke(command);

      expect(result.getRefreshToken).toBe("existing-refresh-token");
      expect(authPersistencePort.saveRefreshToken).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when password does not match", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      userQueryPort.findByNickname.mockResolvedValue(mockUser);

      const command = LoginAuthCommand.of("Robin", "WrongPassword1!");

      await expect(service.invoke(command)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
