import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { DailyTodoModule } from "./hb-backend-api/daily-todo/daily-todo.module";
import { CategoryModule } from "./hb-backend-api/category/category.module";
import { AuthModule } from "./hb-backend-api/auth/auth.module";
import { TransactionModule } from "./infra/mongo/transaction/transaction.module";
import { MenuRecommendationModule } from "./hb-backend-api/menu-recommendation/menu-recommendation.module";
import { TodayMenuModule } from "./hb-backend-api/today-menu/today-menu.module";
import { OutboxModule } from "./hb-backend-api/outbox/outbox.module";
import { TraceContext } from "./shared/trace/trace.context";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TraceInterceptor } from "./shared/adpaters/in/rest/interceptors/trace.interceptor";
import { HttpLogInterceptor } from "./shared/adpaters/in/rest/interceptors/log.interceptor";
import { UserModule } from "./hb-backend-api/user/user.module";
import { FutureMessageModule } from "./hb-backend-api/future-message/future-message.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(String(process.env.HOBOM_SYSTEM_BACKEND_LION_DB)),
    DailyTodoModule,
    CategoryModule,
    AuthModule,
    MenuRecommendationModule,
    TodayMenuModule,
    OutboxModule,
    UserModule,
    TransactionModule,
    FutureMessageModule,
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
