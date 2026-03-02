import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";
import { ResponseWrapInterceptor } from "./shared/adapters/in/rest/interceptors/wrapped-response.interceptor";
import { grpcOptions } from "./infra/grpc/options.grpc";
import { GlobalExceptionFilter } from "./shared/adapters/in/rest/filters/global-exception.filter";
import { DiscordWebhookService } from "./shared/discord/discord-webhook.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV !== "production" ? false : undefined,
    }),
  );
  app.enableCors({
    origin: process.env.HOBOM_CORS_ORIGIN ?? "https://hobom-system.com",
    credentials: true,
  });
  app.use(cookieParser());

  if (process.env.NODE_ENV !== "production") {
    const config = new DocumentBuilder()
      .setTitle("HoBom Backend API Document 🐻🦊")
      .setDescription("HoBom System Backend")
      .setVersion("1.1.0")
      .setLicense("HoBom", "https://github.com/hobom-s")
      .addCookieAuth("accessToken", {
        type: "apiKey",
        in: "cookie",
        name: "accessToken",
        description: "httpOnly 쿠키 (로그인 시 자동 설정)",
      })
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT 액세스 토큰",
        },
        "bearer",
      )
      .addSecurityRequirements("accessToken")
      .addSecurityRequirements("bearer")
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api-docs", app, documentFactory);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseWrapInterceptor());
  app.useGlobalFilters(
    new GlobalExceptionFilter(app.get(DiscordWebhookService)),
  );

  app.connectMicroservice(grpcOptions);

  await app.startAllMicroservices();
  await app.listen(Number(process.env.HOBOM_BACKEND_PORT));

  const logger = app.get(Logger);
  logger.log(
    `REST API server running on port ${process.env.HOBOM_BACKEND_PORT}`,
    "Bootstrap",
  );
  logger.log(`gRPC server running on port 50051`, "Bootstrap");
}

bootstrap().catch((error) => {
  console.error("Bootstrap failed", error);
  process.exit(1);
});
