import { lastValueFrom, of, throwError } from "rxjs";
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { HttpLogInterceptor } from "src/shared/adapters/in/rest/interceptors/log.interceptor";
import { EventType } from "src/hb-backend-api/outbox/domain/model/event-type.enum";
import { OutboxStatus } from "src/hb-backend-api/outbox/domain/model/outbox-status.enum";
import { TraceInfoConstant } from "src/shared/constants/trace-info.constant";
import { UserEntitySchema } from "src/hb-backend-api/user/domain/model/user.entity";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { Types } from "mongoose";

describe("HttpLogInterceptor", () => {
  let interceptor: HttpLogInterceptor;

  const mockTraceContext = {
    getTraceId: jest.fn().mockReturnValue("trace-123"),
  };
  const mockOutboxPort = { save: jest.fn().mockResolvedValue(undefined) };
  const mockUserQueryPort = { findByNickname: jest.fn() };

  const mockUserInfo = UserEntitySchema.of(
    UserId.fromString(new Types.ObjectId().toHexString()),
    "testuser",
    "test@example.com",
    "testnick",
    "hashed-pw",
  );

  const flushPromises = () =>
    new Promise((resolve) => {
      setImmediate(resolve);
    });

  function createRequest(overrides: Record<string, unknown> = {}) {
    return {
      originalUrl: "/api/v1/daily-todos",
      path: "/api/v1/daily-todos",
      method: "GET",
      hostname: "localhost",
      query: {},
      body: {},
      headers: {},
      user: { sub: "testnick" },
      ...overrides,
    };
  }

  function createContext(req: unknown): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;
  }

  function createNext(data: unknown = { success: true }): CallHandler {
    return { handle: () => of(data) } as unknown as CallHandler;
  }

  function createErrorNext(err: Error): CallHandler {
    return {
      handle: () => throwError(() => err),
    } as unknown as CallHandler;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, "warn").mockImplementation();
    mockUserQueryPort.findByNickname.mockResolvedValue(mockUserInfo);

    interceptor = new HttpLogInterceptor(
      mockTraceContext as never,
      mockOutboxPort as never,
      mockUserQueryPort as never,
    );
  });

  describe("skip branches (return next.handle() early)", () => {
    it("should skip logging when URL contains /auth", async () => {
      const req = createRequest({
        originalUrl: "/api/v1/auth/login",
        path: "/api/v1/auth/login",
      });
      const result = await lastValueFrom(
        interceptor.intercept(createContext(req), createNext()),
      );

      expect(result).toEqual({ success: true });
      expect(mockUserQueryPort.findByNickname).not.toHaveBeenCalled();
      expect(mockOutboxPort.save).not.toHaveBeenCalled();
    });

    it("should skip logging when URL contains /internal", async () => {
      const req = createRequest({
        originalUrl: "/internal/health",
        path: "/internal/health",
      });
      const result = await lastValueFrom(
        interceptor.intercept(createContext(req), createNext()),
      );

      expect(result).toEqual({ success: true });
      expect(mockUserQueryPort.findByNickname).not.toHaveBeenCalled();
      expect(mockOutboxPort.save).not.toHaveBeenCalled();
    });

    it("should skip logging when path is /", async () => {
      const req = createRequest({ originalUrl: "/", path: "/" });
      const result = await lastValueFrom(
        interceptor.intercept(createContext(req), createNext()),
      );

      expect(result).toEqual({ success: true });
      expect(mockUserQueryPort.findByNickname).not.toHaveBeenCalled();
      expect(mockOutboxPort.save).not.toHaveBeenCalled();
    });

    it("should skip logging when user.sub is null", async () => {
      const req = createRequest({ user: { sub: null } });
      const result = await lastValueFrom(
        interceptor.intercept(createContext(req), createNext()),
      );

      expect(result).toEqual({ success: true });
      expect(mockUserQueryPort.findByNickname).not.toHaveBeenCalled();
      expect(mockOutboxPort.save).not.toHaveBeenCalled();
    });

    it("should skip logging when user is undefined", async () => {
      const req = createRequest({ user: undefined });
      const result = await lastValueFrom(
        interceptor.intercept(createContext(req), createNext()),
      );

      expect(result).toEqual({ success: true });
      expect(mockUserQueryPort.findByNickname).not.toHaveBeenCalled();
      expect(mockOutboxPort.save).not.toHaveBeenCalled();
    });
  });

  describe("normal flow", () => {
    it("should save outbox log on successful request", async () => {
      const responseData = { id: 1, name: "test" };
      const req = createRequest({ method: "POST" });

      const result = await lastValueFrom(
        interceptor.intercept(createContext(req), createNext(responseData)),
      );

      expect(result).toEqual(responseData);
      expect(mockUserQueryPort.findByNickname).toHaveBeenCalledTimes(1);

      await flushPromises();

      expect(mockOutboxPort.save).toHaveBeenCalledTimes(1);
      const savedOutbox = mockOutboxPort.save.mock.calls[0][0];
      expect(savedOutbox.getEventType).toBe(EventType.HOBOM_LOG);
      expect(savedOutbox.getStatus).toBe(OutboxStatus.PENDING);
      expect(savedOutbox.getPayload["level"]).toBe(TraceInfoConstant.INFO);
      expect(savedOutbox.getPayload["method"]).toBe("POST");
      expect(savedOutbox.getPayload["path"]).toBe("/api/v1/daily-todos");
      expect(savedOutbox.getPayload["statusCode"]).toBe(200);
      expect(savedOutbox.getPayload["userId"]).toBe(
        mockUserInfo.getId.toString(),
      );
      expect(savedOutbox.getPayload["traceId"]).toBe("trace-123");
    });
  });

  describe("error flows", () => {
    it("should call saveErrorLog and rethrow when next.handle() throws", async () => {
      const error = new Error("something broke");

      await expect(
        lastValueFrom(
          interceptor.intercept(
            createContext(createRequest()),
            createErrorNext(error),
          ),
        ),
      ).rejects.toThrow(InternalServerErrorException);

      await flushPromises();

      expect(mockOutboxPort.save).toHaveBeenCalledTimes(1);
      const savedOutbox = mockOutboxPort.save.mock.calls[0][0];
      expect(savedOutbox.getPayload["level"]).toBe(TraceInfoConstant.ERROR);
    });

    it("should use HttpException status code in saveErrorLog", async () => {
      const error = new BadRequestException("bad input");

      await expect(
        lastValueFrom(
          interceptor.intercept(
            createContext(createRequest()),
            createErrorNext(error),
          ),
        ),
      ).rejects.toThrow(InternalServerErrorException);

      await flushPromises();

      expect(mockOutboxPort.save).toHaveBeenCalledTimes(1);
      const savedOutbox = mockOutboxPort.save.mock.calls[0][0];
      expect(savedOutbox.getPayload["statusCode"]).toBe(400);
      expect(savedOutbox.getPayload["payload"]["error"]).toBe("bad input");
    });

    it("should use status 500 for non-HttpException errors in saveErrorLog", async () => {
      const error = new Error("plain error");

      await expect(
        lastValueFrom(
          interceptor.intercept(
            createContext(createRequest()),
            createErrorNext(error),
          ),
        ),
      ).rejects.toThrow(InternalServerErrorException);

      await flushPromises();

      expect(mockOutboxPort.save).toHaveBeenCalledTimes(1);
      const savedOutbox = mockOutboxPort.save.mock.calls[0][0];
      expect(savedOutbox.getPayload["statusCode"]).toBe(500);
      expect(savedOutbox.getPayload["payload"]["error"]).toBe("plain error");
    });

    it("should throw InternalServerErrorException when userQueryPort.findByNickname fails", async () => {
      const dbError = new Error("DB connection lost");
      mockUserQueryPort.findByNickname.mockRejectedValue(dbError);

      let thrown: InternalServerErrorException | undefined;
      try {
        await lastValueFrom(
          interceptor.intercept(createContext(createRequest()), createNext()),
        );
      } catch (e) {
        thrown = e as InternalServerErrorException;
      }

      expect(thrown).toBeInstanceOf(InternalServerErrorException);
      expect(thrown!.getStatus()).toBe(500);
      expect(mockOutboxPort.save).not.toHaveBeenCalled();
    });

    it("should log warning and still return data when saveLog fails", async () => {
      mockOutboxPort.save.mockRejectedValue(new Error("save failed"));
      const responseData = { ok: true };

      const result = await lastValueFrom(
        interceptor.intercept(
          createContext(createRequest()),
          createNext(responseData),
        ),
      );

      expect(result).toEqual(responseData);

      await flushPromises();

      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        expect.stringContaining("Failed to save log"),
      );
    });
  });
});
