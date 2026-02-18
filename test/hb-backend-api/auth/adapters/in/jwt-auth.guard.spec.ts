import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "../../../../../src/shared/adapters/in/rest/guard/jwt-auth.guard";

/**
 * JwtAuthGuard 단위 테스트
 *
 * 검증 시나리오:
 * 1. 유효한 토큰 → super.canActivate 호출 (정상 흐름)
 * 2. 만료된 토큰 + 유효한 refresh token → 새 access token 발급 후 진행
 * 3. 만료된 토큰 + refresh token 없음 → UnauthorizedException
 * 4. 위변조 토큰 (invalid signature) → UnauthorizedException
 */
describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<
    Pick<JwtService, "verify" | "verifyAsync" | "signAsync">
  >;

  const mockSuperCanActivate = jest.fn().mockResolvedValue(true);

  const buildContext = (
    authHeader?: string,
    cookies: Record<string, string> = {},
  ): ExecutionContext => {
    const request = {
      headers: { authorization: authHeader },
      cookies,
      user: null as unknown,
      nickname: "" as string,
    };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    jwtService = {
      verify: jest.fn(),
      verifyAsync: jest.fn(),
      signAsync: jest.fn(),
    };

    guard = new JwtAuthGuard(jwtService as unknown as JwtService);
    // super.canActivate를 mock하여 Passport strategy 실제 실행 방지
    jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), "canActivate")
      .mockImplementation(mockSuperCanActivate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("유효한 토큰", () => {
    it("토큰 검증 성공 시 super.canActivate를 호출해야 한다", async () => {
      jwtService.verify.mockReturnValue({ sub: "Robin", nickname: "Robin" });
      const context = buildContext("Bearer valid-token");

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockSuperCanActivate).toHaveBeenCalledTimes(1);
    });
  });

  describe("만료된 토큰 (TokenExpiredError)", () => {
    const expiredError = Object.assign(new Error("jwt expired"), {
      name: "TokenExpiredError",
    });

    it("refresh token이 있으면 새 access token을 발급하고 진행해야 한다", async () => {
      jwtService.verify.mockImplementation(() => {
        throw expiredError;
      });
      jwtService.verifyAsync.mockResolvedValue({ sub: "Robin" });
      jwtService.signAsync.mockResolvedValue("new-access-token");

      const context = buildContext("Bearer expired-token", {
        refreshToken: "valid-refresh-token",
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        "valid-refresh-token",
      );
      expect(jwtService.signAsync).toHaveBeenCalled();
    });

    it("refresh token이 없으면 UnauthorizedException을 던져야 한다", async () => {
      jwtService.verify.mockImplementation(() => {
        throw expiredError;
      });

      const context = buildContext("Bearer expired-token", {});

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("refresh token도 만료되면 UnauthorizedException을 던져야 한다", async () => {
      jwtService.verify.mockImplementation(() => {
        throw expiredError;
      });
      jwtService.verifyAsync.mockRejectedValue(new Error("jwt expired"));

      const context = buildContext("Bearer expired-token", {
        refreshToken: "expired-refresh-token",
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("위변조/유효하지 않은 토큰", () => {
    it("JsonWebTokenError 시 UnauthorizedException을 던져야 한다", async () => {
      const invalidError = Object.assign(new Error("invalid signature"), {
        name: "JsonWebTokenError",
      });
      jwtService.verify.mockImplementation(() => {
        throw invalidError;
      });

      const context = buildContext("Bearer tampered-token");

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
