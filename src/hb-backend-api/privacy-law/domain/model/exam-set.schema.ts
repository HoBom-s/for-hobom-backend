import { SchemaFactory } from "@nestjs/mongoose";
import { ExamSetEntity } from "./exam-set.entity";

export const ExamSetSchema = SchemaFactory.createForClass(ExamSetEntity);

ExamSetSchema.index({ version: -1 });
ExamSetSchema.index({ lawVersionId: 1 });

export type ExamSetDocument = ExamSetEntity & Document;
