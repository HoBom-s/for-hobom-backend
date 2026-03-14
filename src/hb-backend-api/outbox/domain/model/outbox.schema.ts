import { SchemaFactory } from "@nestjs/mongoose";
import { OutboxEntity } from "./outbox.entity";

export const OutboxSchema = SchemaFactory.createForClass(OutboxEntity);

OutboxSchema.index({ eventType: 1, status: 1 });

export type OutboxDocument = OutboxEntity & Document;
