import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MenuRecommendationEntity } from "./domain/entity/menu-recommendation.entity";
import { MenuRecommendationSchema } from "./domain/entity/menu-recommendation.schema";
import { UserModule } from "../user/user.module";
import { DIToken } from "../../shared/di/token.di";
import { MenuRecommendationRepositoryImpl } from "./domain/repositories/menu-recommendation.repository.impl";
import { MenuRecommendationPersistenceAdapter } from "./adapters/out/persistence/menu-recommendation-persistence.adapter";
import { CreateMenuRecommendationService } from "./application/use-cases/create-menu-recommendation.service";
import { CreateMenuRecommendationController } from "./adapters/in/rest/create-menu-recommendation.controller";

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
  controllers: [CreateMenuRecommendationController],
  providers: [
    {
      provide: DIToken.MenuRecommendationModule.MenuRecommendationRepository,
      useClass: MenuRecommendationRepositoryImpl,
    },
    {
      provide:
        DIToken.MenuRecommendationModule.MenuRecommendationPersistencePort,
      useClass: MenuRecommendationPersistenceAdapter,
    },
    {
      provide: DIToken.MenuRecommendationModule.CreateMenuRecommendationUseCase,
      useClass: CreateMenuRecommendationService,
    },
  ],
  exports: [
    MongooseModule,
    DIToken.MenuRecommendationModule.MenuRecommendationRepository,
    DIToken.MenuRecommendationModule.MenuRecommendationPersistencePort,
    DIToken.MenuRecommendationModule.CreateMenuRecommendationUseCase,
  ],
})
export class MenuRecommendationModule {}
