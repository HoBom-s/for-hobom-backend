import { SchemaFactory } from "@nestjs/mongoose";
import { DailyTodoEntity } from "./daily-todo.entity";

export const DailyTodoSchema = SchemaFactory.createForClass(DailyTodoEntity);
