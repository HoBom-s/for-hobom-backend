import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { ResponseWrapInterceptor } from "./shared/adpaters/in/rest/interceptors/wrapeed-response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseWrapInterceptor());

  await app.listen(Number(process.env.HOBOM_BACKEND_PORT), () => {
    console.log(
      `Welcome to the HoBom System Backend API server on port ${Number(process.env.HOBOM_BACKEND_PORT)} ! 🚀`,
    );
  });
}

bootstrap();
