import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MenuRecommendationEntity } from "./domain/model/menu-recommendation.entity";
import { MenuRecommendationSchema } from "./domain/model/menu-recommendation.schema";
import { UserModule } from "../user/user.module";
import { DIToken } from "../../shared/di/token.di";
import { MenuRecommendationRepositoryImpl } from "./domain/model/menu-recommendation.repository.impl";
import { MenuRecommendationPersistenceAdapter } from "./adapters/out/menu-recommendation-persistence.adapter";
import { CreateMenuRecommendationService } from "./application/use-cases/create-menu-recommendation.service";
import { CreateMenuRecommendationController } from "./adapters/in/create-menu-recommendation.controller";
import { MenuRecommendationQueryAdapter } from "./adapters/out/menu-recommendation-query.adapter";
import { FindAllMenuRecommendationService } from "./application/use-cases/find-all-menu-recommendation.service";
import { FindAllMenuRecommendationController } from "./adapters/in/find-all-menu-recommendation.controller";

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
  controllers: [
    CreateMenuRecommendationController,
    FindAllMenuRecommendationController,
  ],
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
      provide: DIToken.MenuRecommendationModule.MenuRecommendationQueryPort,
      useClass: MenuRecommendationQueryAdapter,
    },
    {
      provide: DIToken.MenuRecommendationModule.CreateMenuRecommendationUseCase,
      useClass: CreateMenuRecommendationService,
    },
    {
      provide:
        DIToken.MenuRecommendationModule.FindAllMenuRecommendationUseCase,
      useClass: FindAllMenuRecommendationService,
    },
  ],
  exports: [
    MongooseModule,
    DIToken.MenuRecommendationModule.MenuRecommendationRepository,
    DIToken.MenuRecommendationModule.MenuRecommendationPersistencePort,
    DIToken.MenuRecommendationModule.MenuRecommendationQueryPort,
    DIToken.MenuRecommendationModule.CreateMenuRecommendationUseCase,
    DIToken.MenuRecommendationModule.FindAllMenuRecommendationUseCase,
  ],
})
export class MenuRecommendationModule {}
