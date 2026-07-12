import { of, Observable } from "rxjs";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { TraceInterceptor } from "src/shared/adapters/in/rest/interceptors/trace.interceptor";
import { TraceContext } from "src/shared/trace/trace.context";

describe("TraceInterceptor", () => {
  let interceptor: TraceInterceptor;
  let traceContext: TraceContext;

  beforeEach(() => {
    traceContext = new TraceContext();
    interceptor = new TraceInterceptor(traceContext);
  });

  function createMockContext(traceIdHeader?: string | string[]) {
    const headers: Record<string, string | string[] | undefined> = {};
    if (traceIdHeader !== undefined) {
      headers["x-hobom-trace-id"] = traceIdHeader;
    }
    const mockSetHeader = jest.fn();

    return {
      context: {
        switchToHttp: () => ({
          getRequest: () => ({ headers }),
          getResponse: () => ({ setHeader: mockSetHeader }),
        }),
      } as unknown as ExecutionContext,
      mockSetHeader,
    };
  }

  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

  const mockNext = {
    handle: () => of("response-data"),
  } as unknown as CallHandler;

  it("should use provided x-hobom-trace-id header", (done) => {
    const { context, mockSetHeader } = createMockContext("custom-trace-id");

    interceptor.intercept(context, mockNext).subscribe({
      next: (value) => {
        expect(value).toBe("response-data");
        expect(mockSetHeader).toHaveBeenCalledWith(
          "x-hobom-trace-id",
          "custom-trace-id",
        );
      },
      complete: () => done(),
    });
  });

  it("should generate UUID when header is absent", (done) => {
    const { context, mockSetHeader } = createMockContext();

    interceptor.intercept(context, mockNext).subscribe({
      next: () => {
        const setTraceId = mockSetHeader.mock.calls[0][1] as string;
        expect(setTraceId).toMatch(UUID_REGEX);
      },
      complete: () => done(),
    });
  });

  it("should generate UUID when header is an array", (done) => {
    const { context, mockSetHeader } = createMockContext(["id-1", "id-2"]);

    interceptor.intercept(context, mockNext).subscribe({
      next: () => {
        const setTraceId = mockSetHeader.mock.calls[0][1] as string;
        expect(setTraceId).toMatch(UUID_REGEX);
      },
      complete: () => done(),
    });
  });

  it("should propagate errors from next.handle()", (done) => {
    const { context } = createMockContext("err-trace");
    const error = new Error("downstream error");
    const errorNext = {
      handle: () =>
        new Observable((observer) => {
          observer.error(error);
        }),
    } as unknown as CallHandler;

    interceptor.intercept(context, errorNext).subscribe({
      error: (err: Error) => {
        expect(err).toBe(error);
        done();
      },
    });
  });

  it("should execute next.handle() inside TraceContext.run()", (done) => {
    const { context } = createMockContext("ctx-trace-id");

    const verifyNext = {
      handle: () =>
        new Observable((observer) => {
          expect(traceContext.getTraceId()).toBe("ctx-trace-id");
          observer.next("ok");
          observer.complete();
        }),
    } as unknown as CallHandler;

    interceptor.intercept(context, verifyNext).subscribe({
      complete: () => done(),
    });
  });
});
