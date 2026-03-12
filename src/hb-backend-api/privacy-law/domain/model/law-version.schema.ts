import { SchemaFactory } from "@nestjs/mongoose";
import { LawVersionEntity } from "./law-version.entity";

export const LawVersionSchema = SchemaFactory.createForClass(LawVersionEntity);

LawVersionSchema.index({ lawId: 1, proclamationDate: -1 });
LawVersionSchema.index({ lawId: 1 });

export type LawVersionDocument = LawVersionEntity & Document;
