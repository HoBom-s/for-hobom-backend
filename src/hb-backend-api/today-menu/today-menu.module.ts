import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TodayMenuEntity } from "./domain/entity/today-menu.entity";
import { TodayMenuSchema } from "./domain/entity/today-menu.schema";
import { MenuRecommendationModule } from "../menu-recommendation/menu-recommendation.module";
import { DIToken } from "../../shared/di/token.di";
import { TodayMenuRepositoryImpl } from "./domain/repositories/today-menu.repository.impl";
import { TodayMenuPersistenceAdapter } from "./adapters/out/persistence/today-menu-persistence.adapter";
import { UpsertTodayMenuService } from "./application/use-cases/upsert-today-menu.service";
import { UpsertTodayMenuController } from "./adapters/in/rest/upsert-today-menu.controller";

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
  controllers: [UpsertTodayMenuController],
  providers: [
    {
      provide: DIToken.TodayMenuModule.TodayMenuRepository,
      useClass: TodayMenuRepositoryImpl,
    },
    {
      provide: DIToken.TodayMenuModule.TodayMenuPersistencePort,
      useClass: TodayMenuPersistenceAdapter,
    },
    {
      provide: DIToken.TodayMenuModule.UpsertTodayMenuUseCase,
      useClass: UpsertTodayMenuService,
    },
  ],
  exports: [
    MongooseModule,
    DIToken.TodayMenuModule.TodayMenuRepository,
    DIToken.TodayMenuModule.TodayMenuPersistencePort,
    DIToken.TodayMenuModule.UpsertTodayMenuUseCase,
  ],
})
export class TodayMenuModule {}
