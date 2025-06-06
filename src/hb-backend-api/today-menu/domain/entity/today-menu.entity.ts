import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";

@Schema({ collection: "today-menu" })
export class TodayMenuEntity extends BaseEntity {
  @Prop({
    type: Types.ObjectId,
    ref: "menu-recommendation",
  })
  recommendedMenu: Types.ObjectId;

  @Prop({
    type: [Types.ObjectId],
    ref: "menu-recommendation",
    default: [],
  })
  candidates: Types.ObjectId[];

  @Prop({
    type: String,
    required: true,
  })
  recommendationDate: string;
}
