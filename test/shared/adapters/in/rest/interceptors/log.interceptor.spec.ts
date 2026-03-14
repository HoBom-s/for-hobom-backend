import { of, throwError } from "rxjs";
import { HttpException, InternalServerErrorException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { HttpLogInterceptor } from "src/shared/adapters/in/rest/interceptors/log.interceptor";
import { TraceContext } from "src/shared/trace/trace.context";
import { DIToken } from "src/shared/di/token.di";
import { UserEntitySchema } from "src/hb-backend-api/user/domain/model/user.entity";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { Types } from "mongoose";

describe("HttpLogInterceptor", () => {
  let interceptor: HttpLogInterceptor;
  const mockSave = jest.fn().mockResolvedValue(undefined);
  const mockFindByNickname = jest.fn();
  const mockGetTraceId = jest.fn().mockReturnValue("trace-123");

  const mockUser = UserEntitySchema.of(
    new UserId(new Types.ObjectId()),
    "testuser",
    "test@test.com",
    "testnick",
    "pw",
  );

  beforeEach(async () => {
    jest.clearAllMocks();
    mockFindByNickname.mockResolvedValue(mockUser);

    const module = await Test.createTestingModule({
      providers: [
        HttpLogInterceptor,
        {
          provide: TraceContext,
          useValue: { getTraceId: mockGetTraceId },
        },
        {
          provide: DIToken.OutboxModule.OutboxPersistencePort,
          useValue: { save: mockSave },
        },
        {
          provide: DIToken.UserModule.UserQueryPort,
          useValue: { findByNickname: mockFindByNickname },
        },
      ],
    }).compile();

    interceptor = module.get(HttpLogInterceptor);
  });

  function createContext(
    url: string,
    opts?: { user?: any; method?: string; path?: string },
  ) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          originalUrl: url,
          path: opts?.path ?? url,
          method: opts?.method ?? "GET",
          hostname: "localhost",
          query: {},
          body: {},
          headers: {},
          user: opts?.user,
        }),
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as any;
  }

  const mockNext = { handle: () => of("data") };

  it("should skip /auth URL", (done) => {
    const ctx = createContext("/auth/login");
    interceptor.intercept(ctx, mockNext).subscribe({
      next: (val) => expect(val).toBe("data"),
      complete: () => {
        expect(mockSave).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it("should skip /internal URL", (done) => {
    const ctx = createContext("/internal/health");
    interceptor.intercept(ctx, mockNext).subscribe({
      next: (val) => expect(val).toBe("data"),
      complete: () => {
        expect(mockSave).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it("should skip root path /", (done) => {
    const ctx = createContext("/", { path: "/" });
    interceptor.intercept(ctx, mockNext).subscribe({
      next: (val) => expect(val).toBe("data"),
      complete: () => {
        expect(mockSave).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it("should skip when user.sub is null", (done) => {
    const ctx = createContext("/api/test", { user: { sub: null } });
    interceptor.intercept(ctx, mockNext).subscribe({
      next: (val) => expect(val).toBe("data"),
      complete: () => {
        expect(mockSave).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it("should skip when user is undefined", (done) => {
    const ctx = createContext("/api/test", { user: undefined });
    interceptor.intercept(ctx, mockNext).subscribe({
      next: (val) => expect(val).toBe("data"),
      complete: () => {
        expect(mockSave).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it("should save outbox log on success", (done) => {
    const ctx = createContext("/api/test", {
      user: { sub: "testnick" },
      method: "POST",
    });

    interceptor.intercept(ctx, mockNext).subscribe({
      next: (val) => expect(val).toBe("data"),
      complete: () => {
        expect(mockFindByNickname).toHaveBeenCalled();
        expect(mockSave).toHaveBeenCalledTimes(1);
        done();
      },
    });
  });

  it("should save error outbox log and rethrow on HttpException", (done) => {
    const ctx = createContext("/api/test", {
      user: { sub: "testnick" },
      method: "GET",
    });
    const httpError = new HttpException("Bad Request", 400);
    const errorNext = { handle: () => throwError(() => httpError) };

    interceptor.intercept(ctx, errorNext).subscribe({
      error: (err: Error) => {
        expect(mockSave).toHaveBeenCalledTimes(1);
        expect(err).toBeInstanceOf(InternalServerErrorException);
        done();
      },
    });
  });

  it("should save error outbox log with status 500 for non-HttpException", (done) => {
    const ctx = createContext("/api/test", {
      user: { sub: "testnick" },
      method: "GET",
    });
    const genericError = new Error("something broke");
    const errorNext = { handle: () => throwError(() => genericError) };

    interceptor.intercept(ctx, errorNext).subscribe({
      error: (err: Error) => {
        expect(mockSave).toHaveBeenCalledTimes(1);
        expect(err).toBeInstanceOf(InternalServerErrorException);
        done();
      },
    });
  });

  it("should throw InternalServerErrorException when userQueryPort fails", (done) => {
    mockFindByNickname.mockRejectedValue(new Error("DB error"));

    const ctx = createContext("/api/test", {
      user: { sub: "testnick" },
      method: "GET",
    });

    interceptor.intercept(ctx, mockNext).subscribe({
      error: (err: InternalServerErrorException) => {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        done();
      },
    });
  });
});
