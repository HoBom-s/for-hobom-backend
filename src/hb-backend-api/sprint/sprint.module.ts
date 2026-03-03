import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SprintEntity } from "./domain/model/sprint.entity";
import { SprintSchema } from "./domain/model/sprint.schema";
import { DIToken } from "../../shared/di/token.di";
import { SprintRepositoryImpl } from "./infra/repositories/sprint.repository.impl";
import { SprintPersistenceAdapter } from "./adapters/out/sprint-persistence.adapter";
import { SprintQueryAdapter } from "./adapters/out/sprint-query.adapter";
import { SprintController } from "./adapters/in/sprint.controller";
import { CreateSprintService } from "./application/use-cases/create-sprint.service";
import { GetSprintService } from "./application/use-cases/get-sprint.service";
import { GetSprintsByProjectService } from "./application/use-cases/get-sprints-by-project.service";
import { UpdateSprintService } from "./application/use-cases/update-sprint.service";
import { DeleteSprintService } from "./application/use-cases/delete-sprint.service";
import { StartSprintService } from "./application/use-cases/start-sprint.service";
import { CompleteSprintService } from "./application/use-cases/complete-sprint.service";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SprintEntity.name, schema: SprintSchema },
    ]),
    UserModule,
  ],
  controllers: [SprintController],
  providers: [
    {
      provide: DIToken.SprintModule.SprintRepository,
      useClass: SprintRepositoryImpl,
    },
    {
      provide: DIToken.SprintModule.SprintPersistencePort,
      useClass: SprintPersistenceAdapter,
    },
    {
      provide: DIToken.SprintModule.SprintQueryPort,
      useClass: SprintQueryAdapter,
    },
    {
      provide: DIToken.SprintModule.CreateSprintUseCase,
      useClass: CreateSprintService,
    },
    {
      provide: DIToken.SprintModule.GetSprintUseCase,
      useClass: GetSprintService,
    },
    {
      provide: DIToken.SprintModule.GetSprintsByProjectUseCase,
      useClass: GetSprintsByProjectService,
    },
    {
      provide: DIToken.SprintModule.UpdateSprintUseCase,
      useClass: UpdateSprintService,
    },
    {
      provide: DIToken.SprintModule.DeleteSprintUseCase,
      useClass: DeleteSprintService,
    },
    {
      provide: DIToken.SprintModule.StartSprintUseCase,
      useClass: StartSprintService,
    },
    {
      provide: DIToken.SprintModule.CompleteSprintUseCase,
      useClass: CompleteSprintService,
    },
  ],
  exports: [
    DIToken.SprintModule.SprintRepository,
    DIToken.SprintModule.SprintPersistencePort,
    DIToken.SprintModule.SprintQueryPort,
    DIToken.SprintModule.CreateSprintUseCase,
    DIToken.SprintModule.GetSprintUseCase,
    DIToken.SprintModule.GetSprintsByProjectUseCase,
    DIToken.SprintModule.UpdateSprintUseCase,
    DIToken.SprintModule.DeleteSprintUseCase,
    DIToken.SprintModule.StartSprintUseCase,
    DIToken.SprintModule.CompleteSprintUseCase,
  ],
})
export class SprintModule {}
