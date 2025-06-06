import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MenuRecommendationEntity } from "./domain/entity/menu-recommendation.entity";
import { MenuRecommendationSchema } from "./domain/entity/menu-recommendation.schema";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MenuRecommendationEntity.name,
        schema: MenuRecommendationSchema,
      },
    ]),
    UserModule,
  ],
  exports: [MongooseModule],
})
export class MenuRecommendationModule {}
