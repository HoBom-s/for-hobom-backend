import { Observable } from "rxjs";
import { randomUUID } from "node:crypto";
import { Request } from "express";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { TraceContext } from "../../../../trace/trace.context";

@Injectable()
export class TraceInterceptor implements NestInterceptor {
  constructor(private readonly traceContext: TraceContext) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const rawTraceId = req.headers["x-hobom-trace-id"];
    const traceId = typeof rawTraceId === "string" ? rawTraceId : randomUUID();

    return new Observable((observer) => {
      this.traceContext.run(traceId, () => {
        next.handle().subscribe({
          next: (value) => observer.next(value),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });
      });
    });
  }
}
