import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../shared/base/base.entity";

@Schema({ collection: "emoji-reaction" })
export class EmojiReactionEntity extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: "user", required: true })
  from: Types.ObjectId;

  @Prop({ type: String, required: true })
  emoji: string;

  @Prop({ type: Date, default: Date.now })
  reactedAt: Date;
}
