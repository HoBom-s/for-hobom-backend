import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { DailyTodoModule } from "./daily-todo/daily-todo.module";
import { RoutineModule } from "./routine/routine.module";
import { CategoryModule } from "./category/category.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(String(process.env.HOBOM_SYSTEM_BACKEND_LION_DB)),
    DailyTodoModule,
    RoutineModule,
    CategoryModule,
  ],
})
export class AppModule {}
