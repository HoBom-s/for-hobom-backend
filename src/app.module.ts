import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { ThrottlerModule } from "@nestjs/throttler";
import { DailyTodoModule } from "./hb-backend-api/daily-todo/daily-todo.module";
import { CategoryModule } from "./hb-backend-api/category/category.module";
import { AuthModule } from "./hb-backend-api/auth/auth.module";
import { TransactionModule } from "./infra/mongo/transaction/transaction.module";
import { MenuRecommendationModule } from "./hb-backend-api/menu-recommendation/menu-recommendation.module";
import { TodayMenuModule } from "./hb-backend-api/today-menu/today-menu.module";
import { OutboxModule } from "./hb-backend-api/outbox/outbox.module";
import { TraceContext } from "./shared/trace/trace.context";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TraceInterceptor } from "./shared/adapters/in/rest/interceptors/trace.interceptor";
import { HttpLogInterceptor } from "./shared/adapters/in/rest/interceptors/log.interceptor";
import { UserModule } from "./hb-backend-api/user/user.module";
import { FutureMessageModule } from "./hb-backend-api/future-message/future-message.module";
import { DiscordWebhookService } from "./shared/discord/discord-webhook.service";
import { HealthModule } from "./hb-backend-api/health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get<string>("LOG_LEVEL", "info"),
          transport:
            configService.get<string>("NODE_ENV") !== "production"
              ? {
                  target: "pino-pretty",
                  options: { colorize: true, singleLine: true },
                }
              : undefined,
          redact: ["req.headers.authorization", "req.headers.cookie"],
        },
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 10 }],
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>("HOBOM_SYSTEM_BACKEND_LION_DB"),
      }),
    }),
    DailyTodoModule,
    CategoryModule,
    AuthModule,
    MenuRecommendationModule,
    TodayMenuModule,
    OutboxModule,
    UserModule,
    TransactionModule,
    FutureMessageModule,
    HealthModule,
  ],
  providers: [
    TraceContext,
    DiscordWebhookService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLogInterceptor,
    },
  ],
})
export class AppModule {}
