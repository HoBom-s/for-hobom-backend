import { SchemaFactory } from "@nestjs/mongoose";
import { QuestionHistoryEntity } from "./question-history.entity";

export const QuestionHistorySchema = SchemaFactory.createForClass(
  QuestionHistoryEntity,
);

QuestionHistorySchema.index({ createdAt: -1 });

export type QuestionHistoryDocument = QuestionHistoryEntity & Document;
