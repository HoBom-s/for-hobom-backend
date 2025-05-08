import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(Number(process.env.HOBOM_BACKEND_PORT), () => {
    console.log("App listening", process.env.HOBOM_BACKEND_PORT);
  });
}
bootstrap();
