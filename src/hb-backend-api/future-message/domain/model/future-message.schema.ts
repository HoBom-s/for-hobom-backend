import { SchemaFactory } from "@nestjs/mongoose";
import { FutureMessageEntity } from "./future-message.entity";

export const FutureMessageSchema =
  SchemaFactory.createForClass(FutureMessageEntity);

export type FutureMessageDocument = FutureMessageEntity & Document;
