import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { MenuKind } from "../enums/menu-kind.enum";
import { MenuTimeOfMealEnum } from "../enums/menu-time-of-meal.enum";
import { FoodType } from "../enums/food-type.enum";

@Schema({ collection: "menu-recommendation" })
export class MenuRecommendationEntity extends BaseEntity {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    enum: MenuKind,
    default: MenuKind.KOREAN,
    require: true,
  })
  menuKind: MenuKind;

  @Prop({
    type: String,
    enum: MenuTimeOfMealEnum,
    default: MenuTimeOfMealEnum.BREAKFAST,
    required: true,
  })
  timeOfMeal: MenuTimeOfMealEnum;

  @Prop({
    type: String,
    enum: FoodType,
    default: FoodType.MEAL,
    required: true,
  })
  foodType: FoodType;

  @Prop({
    type: Types.ObjectId,
    ref: "user",
    required: true,
  })
  registerPerson: Types.ObjectId;
}
