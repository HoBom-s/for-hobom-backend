import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { DiscordWebhookService } from "../../../../discord/discord-webhook.service";

/**
 * 전역 예외 필터.
 *
 * - 5xx (서버 내부 오류)만 Discord로 알람 전송한다.
 * - 4xx (클라이언트 오류: 404 Not Found, 401 Unauthorized 등)는 Discord 전송 대상이 아니다.
 *   클라이언트가 존재하지 않는 경로에 요청하거나 인증 실패 시 발생하는 4xx는
 *   정상적인 운영 상황이므로 알람 스팸을 방지하기 위해 필터링한다.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly discord: DiscordWebhookService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const message =
      exception instanceof HttpException ? exception.getResponse() : exception;

    // 5xx 서버 오류만 Discord 알람 전송 (4xx 클라이언트 오류 제외)
    if (status >= 500) {
      const errorBody =
        exception instanceof HttpException
          ? JSON.stringify(exception.getResponse(), null, 2)
          : String(exception);

      await this.discord.sendErrorMessage(
        `오류가 발생했어요 ! [${status}] ${req.method} ${req.url}\n${req.headers.traceId ? `TraceId: ${String(req.headers.traceId)}` : ""}`,
        `\`\`\`json\n${errorBody}\n\`\`\``,
      );
    }

    res.status(status).json({
      statusCode: status,
      path: req.url,
      message,
    });
  }
}
