import { Test, TestingModule } from "@nestjs/testing";
import { ThrottlerModule } from "@nestjs/throttler";
import { Types } from "mongoose";
import { AuthRefreshTokenController } from "../../../../../src/hb-backend-api/auth/adapters/in/auth-refresh-token.controller";
import { AuthMeController } from "../../../../../src/hb-backend-api/auth/adapters/in/auth-me.controller";
import { AuthLogoutController } from "../../../../../src/hb-backend-api/auth/adapters/in/auth-logout.controller";
import { RefreshAuthTokenUseCase } from "../../../../../src/hb-backend-api/auth/domain/ports/in/refresh-auth-token.use-case";
import { LogoutAuthUseCase } from "../../../../../src/hb-backend-api/auth/domain/ports/in/logout-auth.use-case";
import { GetUserByNicknameUseCase } from "../../../../../src/hb-backend-api/user/domain/ports/in/get-user-by-nickname.use-case";
import { LoginAuthResult } from "../../../../../src/hb-backend-api/auth/domain/ports/out/login-auth.result";
import { UserQueryResult } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.result";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { Request, Response } from "express";

const VALID_REFRESH_TOKEN = "header.payload.signature";

describe("AuthRefreshTokenController", () => {
  let controller: AuthRefreshTokenController;
  let refreshTokenUseCase: jest.Mocked<RefreshAuthTokenUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 10 }] }),
      ],
      controllers: [AuthRefreshTokenController],
      providers: [
        {
          provide: DIToken.AuthModule.RefreshAuthTokenUseCase,
          useValue: { invoke: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(AuthRefreshTokenController);
    refreshTokenUseCase = module.get(
      DIToken.AuthModule.RefreshAuthTokenUseCase,
    );
  });

  describe("refresh()", () => {
    it("should call use case and set both cookies", async () => {
      const mockResult = LoginAuthResult.of(
        "new-access-token",
        "new-refresh-token",
      );
      refreshTokenUseCase.invoke.mockResolvedValue(mockResult);

      const mockRequest = {
        cookies: { refreshToken: VALID_REFRESH_TOKEN },
      } as unknown as Request;

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      await controller.refresh(mockRequest, mockResponse);

      expect(refreshTokenUseCase.invoke).toHaveBeenCalledTimes(1);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "accessToken",
        "new-access-token",
        expect.objectContaining({ httpOnly: true, sameSite: "strict" }),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "new-refresh-token",
        expect.objectContaining({ httpOnly: true, sameSite: "strict" }),
      );
    });

    it("should propagate error when use case throws", async () => {
      refreshTokenUseCase.invoke.mockRejectedValue(new Error("Invalid token"));

      const mockRequest = {
        cookies: { refreshToken: VALID_REFRESH_TOKEN },
      } as unknown as Request;

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      await expect(
        controller.refresh(mockRequest, mockResponse),
      ).rejects.toThrow("Invalid token");
    });
  });
});

describe("AuthMeController", () => {
  let controller: AuthMeController;
  let getUserByNicknameUseCase: jest.Mocked<GetUserByNicknameUseCase>;

  const mockUserId = new UserId(new Types.ObjectId());
  const mockUserResult = new UserQueryResult(
    mockUserId,
    "Robin Yeon",
    "robin@hobom.com",
    "Robin",
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthMeController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: { invoke: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(AuthMeController);
    getUserByNicknameUseCase = module.get(
      DIToken.UserModule.GetUserByNicknameUseCase,
    );
  });

  describe("me()", () => {
    it("should return GetUserDto for the authenticated user", async () => {
      getUserByNicknameUseCase.invoke.mockResolvedValue(mockUserResult);

      const userInfo = {
        nickname: "Robin",
        accessToken: "some-access-token",
      };

      const result = await controller.me(userInfo);

      expect(getUserByNicknameUseCase.invoke).toHaveBeenCalledTimes(1);
      expect(result.id).toBe(mockUserId.toString());
      expect(result.username).toBe("Robin Yeon");
      expect(result.email).toBe("robin@hobom.com");
      expect(result.nickname).toBe("Robin");
    });

    it("should propagate error when use case throws", async () => {
      getUserByNicknameUseCase.invoke.mockRejectedValue(
        new Error("User not found"),
      );

      const userInfo = {
        nickname: "Unknown",
        accessToken: "some-access-token",
      };

      await expect(controller.me(userInfo)).rejects.toThrow("User not found");
    });
  });
});

describe("AuthLogoutController", () => {
  let controller: AuthLogoutController;
  let logoutAuthUseCase: jest.Mocked<LogoutAuthUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthLogoutController],
      providers: [
        {
          provide: DIToken.AuthModule.LogoutAuthUseCase,
          useValue: { invoke: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(AuthLogoutController);
    logoutAuthUseCase = module.get(DIToken.AuthModule.LogoutAuthUseCase);
  });

  describe("logout()", () => {
    it("should call use case and clear both cookies", async () => {
      logoutAuthUseCase.invoke.mockResolvedValue(undefined);

      const mockRequest = {
        cookies: { refreshToken: VALID_REFRESH_TOKEN },
      } as unknown as Request;

      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      await controller.logout(mockRequest, mockResponse);

      expect(logoutAuthUseCase.invoke).toHaveBeenCalledTimes(1);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        "accessToken",
        expect.objectContaining({ httpOnly: true, sameSite: "strict" }),
      );
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.objectContaining({ httpOnly: true, sameSite: "strict" }),
      );
    });

    it("should clear cookies even when no refresh token cookie exists", async () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      await controller.logout(mockRequest, mockResponse);

      expect(logoutAuthUseCase.invoke).not.toHaveBeenCalled();
      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
    });

    it("should clear cookies even when use case throws", async () => {
      logoutAuthUseCase.invoke.mockRejectedValue(new Error("DB error"));

      const mockRequest = {
        cookies: { refreshToken: VALID_REFRESH_TOKEN },
      } as unknown as Request;

      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      await controller.logout(mockRequest, mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
    });
  });
});
