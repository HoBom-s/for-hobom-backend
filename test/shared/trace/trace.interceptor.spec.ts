import { of, Observable } from "rxjs";
import { TraceInterceptor } from "src/shared/adapters/in/rest/interceptors/trace.interceptor";
import { TraceContext } from "src/shared/trace/trace.context";

describe("TraceInterceptor", () => {
  let interceptor: TraceInterceptor;
  let traceContext: TraceContext;

  beforeEach(() => {
    traceContext = new TraceContext();
    interceptor = new TraceInterceptor(traceContext);
  });

  function createMockContext(traceIdHeader?: string) {
    const headers: Record<string, string | undefined> = {};
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
      } as any,
      mockSetHeader,
    };
  }

  const mockNext = { handle: () => of("response-data") };

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
        expect(setTraceId).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        );
      },
      complete: () => done(),
    });
  });

  it("should set traceId in TraceContext run()", (done) => {
    const { context } = createMockContext("ctx-trace-id");
    const spy = jest.spyOn(traceContext, "run");

    interceptor.intercept(context, mockNext).subscribe({
      complete: () => {
        expect(spy).toHaveBeenCalledWith("ctx-trace-id", expect.any(Function));
        done();
      },
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
    };

    interceptor.intercept(context, errorNext).subscribe({
      error: (err: Error) => {
        expect(err).toBe(error);
        done();
      },
    });
  });
});
