import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TodayMenuEntity } from "./domain/entity/today-menu.entity";
import { TodayMenuSchema } from "./domain/entity/today-menu.schema";
import { MenuRecommendationModule } from "../menu-recommendation/menu-recommendation.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TodayMenuEntity.name,
        schema: TodayMenuSchema,
      },
    ]),
    MenuRecommendationModule,
  ],
  exports: [MongooseModule],
})
export class TodayMenuModule {}
