import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { DiscordWebhookService } from "../../../../discord/discord-webhook.service";

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

    // await this.discord.sendErrorMessage(
    //   `🚨 오류가 발생했어요 ! ${req.method} ${req.url} 🚨\n${req.headers.traceId ? `TraceId: ${String(req.headers.traceId)}` : ""}`,
    //   `\`\`\`json\n${JSON.stringify(exception, null, 2)}\n\`\`\``,
    // );

    res.status(status).json({
      statusCode: status,
      path: req.url,
      message,
    });
  }
}
