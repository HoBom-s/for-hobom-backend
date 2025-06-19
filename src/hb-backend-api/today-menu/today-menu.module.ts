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
import { TodayMenuQueryAdapter } from "./adapters/out/query/today-menu-query.adapter";
import { FindTodayMenuByIdService } from "./application/use-cases/find-today-menu-by-id.service";
import { FindTodayMenuByIdController } from "./adapters/in/rest/find-today-menu-by-id.controller";
import { PickTodayMenuService } from "./application/use-cases/pick-today-menu.service";
import { PickTodayMenuController } from "./adapters/in/rest/pick-today-menu.controller";
import { OutboxModule } from "../outbox/outbox.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TodayMenuEntity.name,
        schema: TodayMenuSchema,
      },
    ]),
    MenuRecommendationModule,
    OutboxModule,
  ],
  controllers: [
    UpsertTodayMenuController,
    FindTodayMenuByIdController,
    PickTodayMenuController,
  ],
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
      provide: DIToken.TodayMenuModule.TodayMenuQueryPort,
      useClass: TodayMenuQueryAdapter,
    },
    {
      provide: DIToken.TodayMenuModule.UpsertTodayMenuUseCase,
      useClass: UpsertTodayMenuService,
    },
    {
      provide: DIToken.TodayMenuModule.FindTodayMenuByIdUseCase,
      useClass: FindTodayMenuByIdService,
    },
    {
      provide: DIToken.TodayMenuModule.PickTodayMenuUseCase,
      useClass: PickTodayMenuService,
    },
  ],
  exports: [
    MongooseModule,
    DIToken.TodayMenuModule.TodayMenuRepository,
    DIToken.TodayMenuModule.TodayMenuPersistencePort,
    DIToken.TodayMenuModule.TodayMenuQueryPort,
    DIToken.TodayMenuModule.UpsertTodayMenuUseCase,
    DIToken.TodayMenuModule.FindTodayMenuByIdUseCase,
    DIToken.TodayMenuModule.PickTodayMenuUseCase,
  ],
})
export class TodayMenuModule {}
