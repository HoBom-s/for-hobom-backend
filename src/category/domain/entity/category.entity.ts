import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../shared/base/base.entity";

@Schema({ collection: "category" })
export class CategoryEntity extends BaseEntity {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({
    type: Types.ObjectId,
    ref: "user",
    required: true,
    index: true,
  })
  owner: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: "daily-todo", default: [] })
  dailyTodos: Types.ObjectId[];
}
