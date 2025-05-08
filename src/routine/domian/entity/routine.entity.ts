import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../shared/base/base.entity";

@Schema({ collection: "routine" })
export class RoutineEntity extends BaseEntity {
  @Prop({
    type: Types.ObjectId,
    ref: "user",
    required: true,
    index: true,
  })
  owner: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: "category", default: [] })
  categories: Types.ObjectId[];
}
