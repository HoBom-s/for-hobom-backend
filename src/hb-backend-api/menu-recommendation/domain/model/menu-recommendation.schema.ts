import { SchemaFactory } from "@nestjs/mongoose";
import { MenuRecommendationEntity } from "./menu-recommendation.entity";

export const MenuRecommendationSchema = SchemaFactory.createForClass(
  MenuRecommendationEntity,
);

export type MenuRecommendationDocument = MenuRecommendationEntity & Document;
