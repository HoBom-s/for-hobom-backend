import { SchemaFactory } from "@nestjs/mongoose";
import { OutboxEntity } from "./outbox.entity";

export const OutboxSchema = SchemaFactory.createForClass(OutboxEntity);

export type OutboxDocument = OutboxEntity & Document;
