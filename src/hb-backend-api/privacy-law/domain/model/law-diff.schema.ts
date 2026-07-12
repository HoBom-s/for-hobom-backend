import { SchemaFactory } from "@nestjs/mongoose";
import { LawDiffEntity } from "./law-diff.entity";

export const LawDiffSchema = SchemaFactory.createForClass(LawDiffEntity);

LawDiffSchema.index({ fromVersionId: 1, toVersionId: 1 }, { unique: true });

export type LawDiffDocument = LawDiffEntity & Document;
