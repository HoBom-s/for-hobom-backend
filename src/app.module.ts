import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { DailyTodoModule } from "./hb-backend-api/daily-todo/daily-todo.module";
import { CategoryModule } from "./hb-backend-api/category/category.module";
import { AuthModule } from "./hb-backend-api/auth/auth.module";
import { TransactionModule } from "./infra/mongo/transaction/transaction.module";
import { MenuRecommendationModule } from "./hb-backend-api/menu-recommendation/menu-recommendation.module";
import { TodayMenuModule } from "./hb-backend-api/today-menu/today-menu.module";

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
    TransactionModule,
  ],
})
export class AppModule {}
