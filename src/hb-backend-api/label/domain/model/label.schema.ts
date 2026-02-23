import { SchemaFactory } from "@nestjs/mongoose";
import { LabelEntity } from "./label.entity";

export const LabelSchema = SchemaFactory.createForClass(LabelEntity);

LabelSchema.index({ title: 1, owner: 1 }, { unique: true });

export type LabelDocument = LabelEntity & Document;
