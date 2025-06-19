import { Prop, Schema } from "@nestjs/mongoose";
import { Schema as MongooseSchema } from "mongoose";
import { randomUUID } from "node:crypto";
import { OutboxStatus } from "../enum/outbox-status.enum";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { EventType } from "../enum/event-type.enum";

const { Mixed } = MongooseSchema.Types;

@Schema({ collection: "outbox" })
export class OutboxEntity extends BaseEntity {
  @Prop({
    type: String,
    required: true,
    unique: true,
    default: () => randomUUID(),
  })
  eventId: string;

  @Prop({
    type: String,
    enum: EventType,
    required: true,
  })
  eventType: EventType;

  @Prop({
    type: Mixed,
    required: true,
  })
  payload: Record<string, any>;

  @Prop({
    type: String,
    enum: OutboxStatus,
    default: OutboxStatus.PENDING,
    required: true,
  })
  status: OutboxStatus;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  retryCount: number;

  @Prop({
    type: Date,
    default: null,
  })
  sentAt: Date | null;

  @Prop({
    type: Date,
    default: null,
  })
  failedAt: Date | null;

  @Prop({
    type: String,
    default: null,
  })
  lastError: string | null;

  @Prop({
    type: Number,
    required: true,
    default: 1,
  })
  version: number;
}
