import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DailyTodoEntity } from "./domain/entity/daily-todo.entity";
import { DailyTodoSchema } from "./domain/entity/daily-todo.schema";
import { EmojiReactionEntity } from "./domain/entity/emoji-reaction.entity";
import { EmojiReactionSchema } from "./domain/entity/emoji-reaction.schema";
import { UserModule } from "../user/user.module";
import { DailyTodoController } from "./adapters/in/rest/daily-todo.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DailyTodoEntity.name,
        schema: DailyTodoSchema,
      },
      {
        name: EmojiReactionEntity.name,
        schema: EmojiReactionSchema,
      },
    ]),
    UserModule,
  ],
  exports: [MongooseModule],
  controllers: [DailyTodoController],
})
export class DailyTodoModule {}
