import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { ResponseWrapInterceptor } from "./shared/adpaters/in/rest/interceptors/wrapeed-response.interceptor";
import { grpcOptions } from "./infra/grpc/options.grpc";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  app.connectMicroservice(grpcOptions);

  await app.startAllMicroservices();
  await app.listen(Number(process.env.HOBOM_BACKEND_PORT), () => {
    console.log(
      `🚀 REST API server running on port ${process.env.HOBOM_BACKEND_PORT}`,
    );
    console.log(`📡 gRPC server running on port 50051`);
  });
}

bootstrap()
  .then(() => console.log(`HoBom NestJS Server On ! 🐻🦊`))
  .catch((error) => console.error(error));
