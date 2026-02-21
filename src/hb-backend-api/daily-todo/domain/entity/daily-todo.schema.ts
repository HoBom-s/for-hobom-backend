import { SchemaFactory } from "@nestjs/mongoose";
import { DailyTodoEntity } from "./daily-todo.entity";

export const DailyTodoSchema = SchemaFactory.createForClass(DailyTodoEntity);

DailyTodoSchema.index({ owner: 1, date: 1 });

export type DailyTodoDocument = DailyTodoEntity & Document;
