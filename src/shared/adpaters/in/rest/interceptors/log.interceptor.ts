import { catchError, from, mergeMap, Observable, of } from "rxjs";
import { Request, Response } from "express";
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from "@nestjs/common";
import { TraceContext } from "../../../../trace/trace.context";
import { DIToken } from "../../../../di/token.di";
import { OutboxPersistencePort } from "../../../../../hb-backend-api/outbox/application/ports/out/outbox-persistence.port";
import { OutboxPayloadFactoryRegistry } from "../../../../../hb-backend-api/outbox/domain/factories/outbox-payload-factory.registry";
import { TraceInfoConstant } from "../../../../constants/trace-info.constant";
import { HOBO_BACKEND_SERVICE_TYPE } from "../../../../constants/service-type.constant";
import { CreateOutboxEntity } from "../../../../../hb-backend-api/outbox/domain/entity/create-outbox.entity";
import { EventType } from "../../../../../hb-backend-api/outbox/domain/enum/event-type.enum";
import { OutboxStatus } from "../../../../../hb-backend-api/outbox/domain/enum/outbox-status.enum";
import { convertToHttpMethod } from "../../../../constants/http-method.contant";
import { JwtAuthPayloadModel } from "../../../../../hb-backend-api/auth/domain/model/jwt-auth-payload.model";
import { UserQueryPort } from "../../../../../hb-backend-api/user/application/ports/out/user-query.port";
import { UserNickname } from "../../../../../hb-backend-api/user/domain/vo/user-nickname.vo";

@Injectable()
export class HttpLogInterceptor implements NestInterceptor {
  constructor(
    private readonly traceContext: TraceContext,
    @Inject(DIToken.OutboxModule.OutboxPersistencePort)
    private readonly outboxPersistencePort: OutboxPersistencePort,
    @Inject(DIToken.UserModule.UserQueryPort)
    private readonly userQueryPort: UserQueryPort,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.originalUrl.includes("/auth")) {
      return next.handle();
    }
    const res = context.switchToHttp().getResponse<Response>();
    const result = req.user as JwtAuthPayloadModel;
    const nickname = UserNickname.fromString(result.sub);

    return from(this.userQueryPort.findByNickname(nickname)).pipe(
      mergeMap((userInfo) =>
        next.handle().pipe(
          mergeMap((data) => {
            const payload = OutboxPayloadFactoryRegistry.HOBOM_LOG({
              traceId: this.traceContext.getTraceId(),
              level: TraceInfoConstant.INFO,
              method: convertToHttpMethod(req.method),
              path: req.originalUrl,
              statusCode: res?.statusCode ?? 200,
              host: req.hostname ?? "-",
              userId: userInfo.getId.toString(),
              payload: {
                query: req.query,
                body: (typeof req.body === "object" ? req.body : {}) as Record<
                  string,
                  any
                >,
                headers: req.headers,
              },
              serviceType: HOBO_BACKEND_SERVICE_TYPE,
              message: `[${req.method}]-${req.originalUrl}`,
            });

            const outbox = CreateOutboxEntity.of(
              EventType.HOBOM_LOG,
              payload,
              OutboxStatus.PENDING,
              1,
              1,
            );

            return from(this.outboxPersistencePort.save(outbox)).pipe(
              mergeMap(() => of(data)),
            );
          }),
          catchError((err) =>
            from(
              (async () => {
                const payload = OutboxPayloadFactoryRegistry.HOBOM_LOG({
                  traceId: this.traceContext.getTraceId(),
                  level: TraceInfoConstant.ERROR,
                  method: convertToHttpMethod(req.method),
                  path: req.originalUrl,
                  statusCode: res?.statusCode ?? 500,
                  host: req.hostname ?? "-",
                  userId: userInfo.getId.toString(),
                  payload: {
                    query: req.query,
                    body: (typeof req.body === "object"
                      ? req.body
                      : {}) as Record<string, any>,
                    headers: req.headers,
                    error: String(err.message ?? "Unknown error"),
                  },
                  serviceType: HOBO_BACKEND_SERVICE_TYPE,
                  message: `[${req.method}] ${req.originalUrl} - ERROR`,
                });

                const outbox = CreateOutboxEntity.of(
                  EventType.HOBOM_LOG,
                  payload,
                  OutboxStatus.PENDING,
                  1,
                  1,
                );

                await this.outboxPersistencePort.save(outbox);
                throw err;
              })(),
            ),
          ),
        ),
      ),
      catchError((err) => {
        throw new InternalServerErrorException(
          err,
          `Cannot find user info: ${result.sub}`,
        );
      }),
    );
  }
}
