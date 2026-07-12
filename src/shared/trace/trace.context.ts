import { AsyncLocalStorage } from "async_hooks";
import { Injectable } from "@nestjs/common";

interface TraceStore {
  traceId: string;
}

@Injectable()
export class TraceContext {
  private static readonly asyncLocalStorage =
    new AsyncLocalStorage<TraceStore>();

  run(traceId: string, callback: () => void) {
    TraceContext.asyncLocalStorage.run({ traceId }, callback);
  }

  getTraceId(): string {
    return TraceContext.asyncLocalStorage.getStore()?.traceId ?? "";
  }
}
