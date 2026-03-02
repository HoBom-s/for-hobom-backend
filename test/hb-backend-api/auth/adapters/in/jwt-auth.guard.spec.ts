import { ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "../../../../../src/shared/adapters/in/rest/guard/jwt-auth.guard";

/**
 * JwtAuthGuard 단위 테스트
 *
 * Guard는 Passport AuthGuard("jwt")에 위임한다.
 * 토큰 검증은 JwtStrategy가 담당하며, guard는 super.canActivate()를 호출할 뿐이다.
 */
describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<Pick<JwtService, "verify">>;

  const mockSuperCanActivate = jest.fn().mockResolvedValue(true);

  const buildContext = (): ExecutionContext => {
    const request = {
      headers: { authorization: "Bearer valid-token" },
      cookies: {},
      user: null as unknown,
    };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    jwtService = { verify: jest.fn() };
    guard = new JwtAuthGuard(jwtService as unknown as JwtService);
    jest
      .spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(guard)),
        "canActivate",
      )
      .mockImplementation(mockSuperCanActivate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("super.canActivate에 위임해야 한다", async () => {
    const context = buildContext();
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockSuperCanActivate).toHaveBeenCalledTimes(1);
  });
});
