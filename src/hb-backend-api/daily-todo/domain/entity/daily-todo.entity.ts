import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { EmojiReactionSchema } from "./emoji-reaction.schema";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { DailyTodoCompleteStatus } from "../enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "../enums/daily-todo-cycle.enum";

@Schema({ collection: "daily-todo" })
export class DailyTodoEntity extends BaseEntity {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  date: string;

  @Prop({
    type: Types.ObjectId,
    ref: "user",
    required: true,
    index: true,
  })
  owner: Types.ObjectId;

  @Prop({ type: EmojiReactionSchema, default: null })
  reaction: Types.ObjectId;

  @Prop({
    type: String,
    enum: DailyTodoCompleteStatus,
    default: DailyTodoCompleteStatus.PROGRESS,
  })
  progress: DailyTodoCompleteStatus;

  @Prop({
    type: String,
    enum: DailyTodoCompleteStatus,
    default: DailyTodoCycle.EVERYDAY,
  })
  cycle: DailyTodoCycle;

  @Prop({ type: Types.ObjectId, ref: "category", required: false })
  categoryId?: Types.ObjectId;
}
