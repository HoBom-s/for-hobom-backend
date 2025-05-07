import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(String(process.env.HOBOM_SYSTEM_BACKEND_LION_DB)),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
