import { of } from "rxjs";
import { CookiesInterceptor } from "src/shared/adapters/in/rest/interceptors/cookie.interceptor";

describe("CookiesInterceptor", () => {
  let interceptor: CookiesInterceptor;

  beforeEach(() => {
    interceptor = new CookiesInterceptor();
  });

  function createContext() {
    const mockCookie = jest.fn();
    return {
      context: {
        switchToHttp: () => ({
          getResponse: () => ({ cookie: mockCookie }),
        }),
      } as any,
      mockCookie,
    };
  }

  it("should set both cookies when tokens are present", (done) => {
    const { context, mockCookie } = createContext();
    const data = { accessToken: "at-123", refreshToken: "rt-456" };

    interceptor.intercept(context, { handle: () => of(data) }).subscribe({
      next: () => {
        expect(mockCookie).toHaveBeenCalledTimes(2);
        expect(mockCookie).toHaveBeenCalledWith(
          "accessToken",
          "at-123",
          expect.objectContaining({
            httpOnly: true,
            sameSite: "strict",
          }),
        );
        expect(mockCookie).toHaveBeenCalledWith(
          "refreshToken",
          "rt-456",
          expect.objectContaining({
            httpOnly: true,
            sameSite: "strict",
          }),
        );
      },
      complete: () => done(),
    });
  });

  it("should throw Error when accessToken is null", (done) => {
    const { context } = createContext();
    const data = { accessToken: null, refreshToken: "rt-456" };

    interceptor.intercept(context, { handle: () => of(data) }).subscribe({
      error: (err: Error) => {
        expect(err.message).toContain("토큰");
        done();
      },
    });
  });

  it("should throw Error when refreshToken is null", (done) => {
    const { context } = createContext();
    const data = { accessToken: "at-123", refreshToken: null };

    interceptor.intercept(context, { handle: () => of(data) }).subscribe({
      error: (err: Error) => {
        expect(err.message).toContain("토큰");
        done();
      },
    });
  });
});
