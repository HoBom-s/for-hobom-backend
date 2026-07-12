import { SchemaFactory } from "@nestjs/mongoose";
import { SprintEntity } from "./sprint.entity";

export const SprintSchema = SchemaFactory.createForClass(SprintEntity);

SprintSchema.index({ project: 1, status: 1 });
SprintSchema.index({ project: 1, startDate: -1 });

export type SprintDocument = SprintEntity & Document;
