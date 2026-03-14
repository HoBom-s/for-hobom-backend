import { randomUUID } from "node:crypto";
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
import { DiscordModule } from "./shared/discord/discord.module";
import { LabelModule } from "./hb-backend-api/label/label.module";
import { NoteModule } from "./hb-backend-api/note/note.module";
import { NotificationModule } from "./hb-backend-api/notification/notification.module";
import { HealthModule } from "./hb-backend-api/health/health.module";
import { DashboardModule } from "./hb-backend-api/dashboard/dashboard.module";
import { ProjectModule } from "./hb-backend-api/project/project.module";
import { IssueModule } from "./hb-backend-api/issue/issue.module";
import { SprintModule } from "./hb-backend-api/sprint/sprint.module";
import { BoardModule } from "./hb-backend-api/board/board.module";
import { ProjectLabelModule } from "./hb-backend-api/project-label/project-label.module";
import { PrivacyLawModule } from "./hb-backend-api/privacy-law/privacy-law.module";
import { DlqModule } from "./hb-backend-api/dlq/dlq.module";

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
          genReqId: (req) => {
            const raw = req.headers["x-hobom-trace-id"];
            return typeof raw === "string" ? raw : randomUUID();
          },
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
    LabelModule,
    NoteModule,
    NotificationModule,
    HealthModule,
    DashboardModule,
    ProjectModule,
    IssueModule,
    SprintModule,
    BoardModule,
    ProjectLabelModule,
    PrivacyLawModule,
    DlqModule,
    DiscordModule,
  ],
  providers: [
    TraceContext,
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
