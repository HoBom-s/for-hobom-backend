import { CallHandler, ExecutionContext } from "@nestjs/common";
import { lastValueFrom, of } from "rxjs";
import { CookiesInterceptor } from "src/shared/adapters/in/rest/interceptors/cookie.interceptor";

describe("CookiesInterceptor", () => {
  let interceptor: CookiesInterceptor;

  beforeEach(() => {
    interceptor = new CookiesInterceptor();
  });

  const mockResponse = { cookie: jest.fn() };

  const createContext = () =>
    ({
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    }) as unknown as ExecutionContext;

  const createNext = (data: unknown) =>
    ({
      handle: () => of(data),
    }) as unknown as CallHandler;

  afterEach(() => {
    jest.restoreAllMocks();
    mockResponse.cookie.mockClear();
  });

  it("정상 토큰 데이터 → response.cookie 2번 호출", async () => {
    const data = { accessToken: "at-123", refreshToken: "rt-456" };

    await lastValueFrom(
      interceptor.intercept(createContext(), createNext(data)),
    );

    expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      "accessToken",
      "at-123",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      }),
    );
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      "refreshToken",
      "rt-456",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      }),
    );
  });

  it("accessToken이 null이면 Error를 throw한다", async () => {
    const data = { accessToken: null, refreshToken: "rt-456" };

    await expect(
      lastValueFrom(interceptor.intercept(createContext(), createNext(data))),
    ).rejects.toThrow("검증할 토큰이 존재하지 않아요.");
  });

  it("refreshToken이 null이면 Error를 throw한다", async () => {
    const data = { accessToken: "at-123", refreshToken: null };

    await expect(
      lastValueFrom(interceptor.intercept(createContext(), createNext(data))),
    ).rejects.toThrow("검증할 토큰이 존재하지 않아요.");
  });

  it("accessToken이 undefined이면 Error를 throw한다", async () => {
    const data = { accessToken: undefined, refreshToken: "rt-456" };

    await expect(
      lastValueFrom(interceptor.intercept(createContext(), createNext(data))),
    ).rejects.toThrow("검증할 토큰이 존재하지 않아요.");
  });

  it("NODE_ENV=production이면 secure: true로 쿠키를 설정한다", async () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const data = { accessToken: "at-123", refreshToken: "rt-456" };

    await lastValueFrom(
      interceptor.intercept(createContext(), createNext(data)),
    );

    expect(mockResponse.cookie).toHaveBeenCalledWith(
      "accessToken",
      "at-123",
      expect.objectContaining({ secure: true }),
    );
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      "refreshToken",
      "rt-456",
      expect.objectContaining({ secure: true }),
    );

    process.env.NODE_ENV = original;
  });
});
