import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ProjectLabelEntity } from "./domain/model/project-label.entity";
import { ProjectLabelSchema } from "./domain/model/project-label.schema";
import { DIToken } from "../../shared/di/token.di";
import { ProjectLabelRepositoryImpl } from "./infra/repositories/project-label.repository.impl";
import { ProjectLabelPersistenceAdapter } from "./adapters/out/project-label-persistence.adapter";
import { ProjectLabelQueryAdapter } from "./adapters/out/project-label-query.adapter";
import { ProjectLabelController } from "./adapters/in/project-label.controller";
import { CreateProjectLabelService } from "./application/use-cases/create-project-label.service";
import { GetProjectLabelsService } from "./application/use-cases/get-project-labels.service";
import { UpdateProjectLabelService } from "./application/use-cases/update-project-label.service";
import { DeleteProjectLabelService } from "./application/use-cases/delete-project-label.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProjectLabelEntity.name, schema: ProjectLabelSchema },
    ]),
  ],
  controllers: [ProjectLabelController],
  providers: [
    {
      provide: DIToken.ProjectLabelModule.ProjectLabelRepository,
      useClass: ProjectLabelRepositoryImpl,
    },
    {
      provide: DIToken.ProjectLabelModule.ProjectLabelPersistencePort,
      useClass: ProjectLabelPersistenceAdapter,
    },
    {
      provide: DIToken.ProjectLabelModule.ProjectLabelQueryPort,
      useClass: ProjectLabelQueryAdapter,
    },
    {
      provide: DIToken.ProjectLabelModule.CreateProjectLabelUseCase,
      useClass: CreateProjectLabelService,
    },
    {
      provide: DIToken.ProjectLabelModule.GetProjectLabelsUseCase,
      useClass: GetProjectLabelsService,
    },
    {
      provide: DIToken.ProjectLabelModule.UpdateProjectLabelUseCase,
      useClass: UpdateProjectLabelService,
    },
    {
      provide: DIToken.ProjectLabelModule.DeleteProjectLabelUseCase,
      useClass: DeleteProjectLabelService,
    },
  ],
  exports: [
    DIToken.ProjectLabelModule.ProjectLabelRepository,
    DIToken.ProjectLabelModule.ProjectLabelPersistencePort,
    DIToken.ProjectLabelModule.ProjectLabelQueryPort,
    DIToken.ProjectLabelModule.CreateProjectLabelUseCase,
    DIToken.ProjectLabelModule.GetProjectLabelsUseCase,
    DIToken.ProjectLabelModule.UpdateProjectLabelUseCase,
    DIToken.ProjectLabelModule.DeleteProjectLabelUseCase,
  ],
})
export class ProjectLabelModule {}
