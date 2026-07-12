import { SchemaFactory } from "@nestjs/mongoose";
import { BoardEntity } from "./board.entity";

export const BoardSchema = SchemaFactory.createForClass(BoardEntity);

BoardSchema.index({ project: 1 });

export type BoardDocument = BoardEntity & Document;
