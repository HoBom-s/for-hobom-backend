import { SchemaFactory } from "@nestjs/mongoose";
import { TodayMenuEntity } from "./today-menu.entity";

export const TodayMenuSchema = SchemaFactory.createForClass(TodayMenuEntity);

export type TodayMenuDocument = TodayMenuEntity & Document;
