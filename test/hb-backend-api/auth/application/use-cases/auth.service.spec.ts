import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { TokenExpiredError } from "jsonwebtoken";
import { LogoutAuthService } from "../../../../../src/hb-backend-api/auth/application/use-cases/logout-auth.service";
import { RefreshTokenAuthService } from "../../../../../src/hb-backend-api/auth/application/use-cases/refresh-token-auth.service";
import { AuthPersistencePort } from "../../../../../src/hb-backend-api/auth/domain/ports/out/auth-persistence.port";
import { AuthQueryPort } from "../../../../../src/hb-backend-api/auth/domain/ports/out/auth-query.port";
import { JwtAuthPort } from "../../../../../src/hb-backend-api/auth/domain/ports/out/jwt-auth.port";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { TransactionRunner } from "../../../../../src/infra/mongo/transaction/transaction.runner";
import { RefreshToken } from "../../../../../src/hb-backend-api/auth/domain/model/refresh-token.vo";
import { AuthEntitySchema } from "../../../../../src/hb-backend-api/auth/domain/model/auth.entity";

const VALID_REFRESH_TOKEN = "header.payload.signature";

describe("LogoutAuthService", () => {
  let service: LogoutAuthService;
  let authPersistencePort: jest.Mocked<AuthPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutAuthService,
        {
          provide: DIToken.AuthModule.AuthPersistencePort,
          useValue: { revokeToken: jest.fn() },
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(LogoutAuthService);
    authPersistencePort = module.get(DIToken.AuthModule.AuthPersistencePort);
  });

  describe("invoke()", () => {
    it("should revoke the refresh token", async () => {
      const refreshToken = RefreshToken.fromString(VALID_REFRESH_TOKEN);
      authPersistencePort.revokeToken.mockResolvedValue(undefined);

      await service.invoke(refreshToken);

      expect(authPersistencePort.revokeToken).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(authPersistencePort.revokeToken).toHaveBeenCalledTimes(1);
    });

    it("should propagate error when revokeToken fails", async () => {
      const refreshToken = RefreshToken.fromString(VALID_REFRESH_TOKEN);
      authPersistencePort.revokeToken.mockRejectedValue(new Error("DB error"));

      await expect(service.invoke(refreshToken)).rejects.toThrow("DB error");
    });
  });
});

describe("RefreshTokenAuthService", () => {
  let service: RefreshTokenAuthService;
  let jwtAuthPort: jest.Mocked<JwtAuthPort>;
  let authQueryPort: jest.Mocked<AuthQueryPort>;
  let authPersistencePort: jest.Mocked<AuthPersistencePort>;

  const futureExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const mockAuthEntity = AuthEntitySchema.of(
    "Robin",
    VALID_REFRESH_TOKEN,
    futureExpiry,
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenAuthService,
        {
          provide: DIToken.AuthModule.JwtAuthPort,
          useValue: {
            verifyRefreshToken: jest.fn(),
            verifyRefreshTokenIgnoreExpiry: jest.fn(),
            signAccessToken: jest.fn(),
            signRefreshToken: jest.fn(),
          },
        },
        {
          provide: DIToken.AuthModule.AuthQueryPort,
          useValue: { findByRefreshToken: jest.fn() },
        },
        {
          provide: DIToken.AuthModule.AuthPersistencePort,
          useValue: { updateRefreshToken: jest.fn() },
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(RefreshTokenAuthService);
    jwtAuthPort = module.get(DIToken.AuthModule.JwtAuthPort);
    authQueryPort = module.get(DIToken.AuthModule.AuthQueryPort);
    authPersistencePort = module.get(DIToken.AuthModule.AuthPersistencePort);
  });

  describe("invoke() - valid (non-expired) token", () => {
    it("should return new access token with same refresh token", async () => {
      const refreshToken = RefreshToken.fromString(VALID_REFRESH_TOKEN);
      jwtAuthPort.verifyRefreshToken.mockReturnValue({ sub: "Robin" });
      authQueryPort.findByRefreshToken.mockResolvedValue(mockAuthEntity);
      jwtAuthPort.signAccessToken.mockReturnValue("new-access-token");

      const result = await service.invoke(refreshToken);

      expect(result.getAccessToken).toBe("new-access-token");
      expect(result.getRefreshToken).toBe(VALID_REFRESH_TOKEN);
      expect(jwtAuthPort.signAccessToken).toHaveBeenCalledWith({
        sub: "Robin",
      });
      expect(authPersistencePort.updateRefreshToken).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException when auth user is null", async () => {
      const refreshToken = RefreshToken.fromString(VALID_REFRESH_TOKEN);
      jwtAuthPort.verifyRefreshToken.mockReturnValue({ sub: "Robin" });
      authQueryPort.findByRefreshToken.mockResolvedValue(null as never);

      await expect(service.invoke(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException when nickname does not match payload sub", async () => {
      const refreshToken = RefreshToken.fromString(VALID_REFRESH_TOKEN);
      jwtAuthPort.verifyRefreshToken.mockReturnValue({ sub: "Robin" });

      const mismatchedAuth = AuthEntitySchema.of(
        "DifferentUser",
        VALID_REFRESH_TOKEN,
        futureExpiry,
      );
      authQueryPort.findByRefreshToken.mockResolvedValue(mismatchedAuth);

      await expect(service.invoke(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("invoke() - expired token (TokenExpiredError)", () => {
    it("should rotate both tokens when refresh token is expired", async () => {
      const refreshToken = RefreshToken.fromString(VALID_REFRESH_TOKEN);

      jwtAuthPort.verifyRefreshToken.mockImplementation(() => {
        throw new TokenExpiredError("jwt expired", new Date());
      });
      jwtAuthPort.verifyRefreshTokenIgnoreExpiry.mockReturnValue({
        sub: "Robin",
      });
      authQueryPort.findByRefreshToken.mockResolvedValue(mockAuthEntity);
      jwtAuthPort.signAccessToken.mockReturnValue("rotated-access-token");
      jwtAuthPort.signRefreshToken.mockReturnValue("rotated.refresh.token");
      authPersistencePort.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.invoke(refreshToken);

      expect(result.getAccessToken).toBe("rotated-access-token");
      expect(result.getRefreshToken).toBe("rotated.refresh.token");
      expect(authPersistencePort.updateRefreshToken).toHaveBeenCalledTimes(1);
    });

    it("should throw UnauthorizedException when decoded sub is null", async () => {
      const refreshToken = RefreshToken.fromString(VALID_REFRESH_TOKEN);

      jwtAuthPort.verifyRefreshToken.mockImplementation(() => {
        throw new TokenExpiredError("jwt expired", new Date());
      });
      jwtAuthPort.verifyRefreshTokenIgnoreExpiry.mockReturnValue({
        sub: null as never,
      });

      await expect(service.invoke(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException when auth user not found for expired token", async () => {
      const refreshToken = RefreshToken.fromString(VALID_REFRESH_TOKEN);

      jwtAuthPort.verifyRefreshToken.mockImplementation(() => {
        throw new TokenExpiredError("jwt expired", new Date());
      });
      jwtAuthPort.verifyRefreshTokenIgnoreExpiry.mockReturnValue({
        sub: "Robin",
      });
      authQueryPort.findByRefreshToken.mockResolvedValue(null as never);

      await expect(service.invoke(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException when nickname mismatch for expired token", async () => {
      const refreshToken = RefreshToken.fromString(VALID_REFRESH_TOKEN);

      jwtAuthPort.verifyRefreshToken.mockImplementation(() => {
        throw new TokenExpiredError("jwt expired", new Date());
      });
      jwtAuthPort.verifyRefreshTokenIgnoreExpiry.mockReturnValue({
        sub: "Robin",
      });

      const mismatchedAuth = AuthEntitySchema.of(
        "DifferentUser",
        VALID_REFRESH_TOKEN,
        futureExpiry,
      );
      authQueryPort.findByRefreshToken.mockResolvedValue(mismatchedAuth);

      await expect(service.invoke(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("invoke() - other errors", () => {
    it("should re-throw UnauthorizedException as-is", async () => {
      const refreshToken = RefreshToken.fromString(VALID_REFRESH_TOKEN);

      jwtAuthPort.verifyRefreshToken.mockImplementation(() => {
        throw new UnauthorizedException("Token 이 일치하지 않아요.");
      });

      await expect(service.invoke(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should wrap unknown errors as UnauthorizedException", async () => {
      const refreshToken = RefreshToken.fromString(VALID_REFRESH_TOKEN);

      jwtAuthPort.verifyRefreshToken.mockImplementation(() => {
        throw new Error("JsonWebTokenError");
      });

      await expect(service.invoke(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
