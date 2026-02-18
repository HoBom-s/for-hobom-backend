import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";
import { ResponseWrapInterceptor } from "./shared/adapters/in/rest/interceptors/wrapped-response.interceptor";
import { grpcOptions } from "./infra/grpc/options.grpc";
import { GlobalExceptionFilter } from "./shared/adapters/in/rest/filters/global-exception.filter";
import { DiscordWebhookService } from "./shared/discord/discord-webhook.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const config = new DocumentBuilder()
    .setTitle("HoBom Backend API Document 🐻🦊")
    .setDescription("HoBom System Backend")
    .setVersion("1.1.0")
    .setLicense("HoBom", "https://github.com/hobom-s")
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, documentFactory);

  app.enableCors();
  app.use(cookieParser());
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
