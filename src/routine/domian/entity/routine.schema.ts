import { SchemaFactory } from "@nestjs/mongoose";
import { RoutineEntity } from "./routine.entity";

export const RoutineSchema = SchemaFactory.createForClass(RoutineEntity);
