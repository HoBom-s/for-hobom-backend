import { Prop, Schema } from "@nestjs/mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { SendStatus } from "./send-status.enum";

@Schema({ collection: "future-message" })
export class FutureMessageEntity extends BaseEntity {
  @Prop({
    type: String,
    required: true,
  })
  senderId: string;

  @Prop({
    type: String,
    required: true,
  })
  recipientId: string;

  @Prop({
    type: String,
    required: true,
  })
  content: string;

  @Prop({
    type: String,
    required: true,
  })
  scheduledAt: string;

  @Prop({
    type: String,
    enum: SendStatus,
    default: SendStatus.PENDING,
    required: false,
  })
  sendStatus: SendStatus;
}
