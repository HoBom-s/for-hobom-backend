import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CategoryEntity } from "./domain/entity/category.entity";
import { CategorySchema } from "./domain/entity/category.schema";
import { DailyTodoModule } from "../daily-todo/daily-todo.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CategoryEntity.name,
        schema: CategorySchema,
      },
    ]),
    DailyTodoModule,
  ],
  exports: [MongooseModule],
})
export class CategoryModule {}
