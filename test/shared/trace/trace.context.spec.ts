import { TraceContext } from "src/shared/trace/trace.context";

describe("TraceContext", () => {
  let traceContext: TraceContext;

  beforeEach(() => {
    traceContext = new TraceContext();
  });

  it("should return traceId inside run()", (done) => {
    traceContext.run("abc-123", () => {
      expect(traceContext.getTraceId()).toBe("abc-123");
      done();
    });
  });

  it("should return empty string outside run()", () => {
    expect(traceContext.getTraceId()).toBe("");
  });

  it("should isolate traceIds between nested runs", (done) => {
    traceContext.run("outer", () => {
      expect(traceContext.getTraceId()).toBe("outer");
      traceContext.run("inner", () => {
        expect(traceContext.getTraceId()).toBe("inner");
        done();
      });
    });
  });
});
