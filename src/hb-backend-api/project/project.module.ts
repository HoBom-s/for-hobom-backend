import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ProjectEntity } from "./domain/model/project.entity";
import { ProjectSchema } from "./domain/model/project.schema";
import { DIToken } from "../../shared/di/token.di";
import { ProjectRepositoryImpl } from "./infra/repositories/project.repository.impl";
import { ProjectPersistenceAdapter } from "./adapters/out/project-persistence.adapter";
import { ProjectQueryAdapter } from "./adapters/out/project-query.adapter";
import { CreateProjectService } from "./application/use-cases/create-project.service";
import { GetProjectService } from "./application/use-cases/get-project.service";
import { GetMyProjectsService } from "./application/use-cases/get-my-projects.service";
import { UpdateProjectService } from "./application/use-cases/update-project.service";
import { DeleteProjectService } from "./application/use-cases/delete-project.service";
import { AddProjectMemberService } from "./application/use-cases/add-project-member.service";
import { RemoveProjectMemberService } from "./application/use-cases/remove-project-member.service";
import { UpdateProjectMemberRoleService } from "./application/use-cases/update-project-member-role.service";
import { UpdateProjectWorkflowService } from "./application/use-cases/update-project-workflow.service";
import { UpdateProjectIssueTypesService } from "./application/use-cases/update-project-issue-types.service";
import { UpdateProjectPrioritiesService } from "./application/use-cases/update-project-priorities.service";
import { IssueModule } from "../issue/issue.module";
import { SprintModule } from "../sprint/sprint.module";
import { BoardModule } from "../board/board.module";
import { ProjectLabelModule } from "../project-label/project-label.module";
import { UserModule } from "../user/user.module";
import { ProjectController } from "./adapters/in/project.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ProjectEntity.name,
        schema: ProjectSchema,
      },
    ]),
    forwardRef(() => IssueModule),
    SprintModule,
    BoardModule,
    ProjectLabelModule,
    UserModule,
  ],
  controllers: [ProjectController],
  providers: [
    {
      provide: DIToken.ProjectModule.ProjectRepository,
      useClass: ProjectRepositoryImpl,
    },
    {
      provide: DIToken.ProjectModule.ProjectPersistencePort,
      useClass: ProjectPersistenceAdapter,
    },
    {
      provide: DIToken.ProjectModule.ProjectQueryPort,
      useClass: ProjectQueryAdapter,
    },
    {
      provide: DIToken.ProjectModule.CreateProjectUseCase,
      useClass: CreateProjectService,
    },
    {
      provide: DIToken.ProjectModule.GetProjectUseCase,
      useClass: GetProjectService,
    },
    {
      provide: DIToken.ProjectModule.GetMyProjectsUseCase,
      useClass: GetMyProjectsService,
    },
    {
      provide: DIToken.ProjectModule.UpdateProjectUseCase,
      useClass: UpdateProjectService,
    },
    {
      provide: DIToken.ProjectModule.DeleteProjectUseCase,
      useClass: DeleteProjectService,
    },
    {
      provide: DIToken.ProjectModule.AddProjectMemberUseCase,
      useClass: AddProjectMemberService,
    },
    {
      provide: DIToken.ProjectModule.RemoveProjectMemberUseCase,
      useClass: RemoveProjectMemberService,
    },
    {
      provide: DIToken.ProjectModule.UpdateProjectMemberRoleUseCase,
      useClass: UpdateProjectMemberRoleService,
    },
    {
      provide: DIToken.ProjectModule.UpdateProjectWorkflowUseCase,
      useClass: UpdateProjectWorkflowService,
    },
    {
      provide: DIToken.ProjectModule.UpdateProjectIssueTypesUseCase,
      useClass: UpdateProjectIssueTypesService,
    },
    {
      provide: DIToken.ProjectModule.UpdateProjectPrioritiesUseCase,
      useClass: UpdateProjectPrioritiesService,
    },
  ],
  exports: [
    MongooseModule,
    DIToken.ProjectModule.ProjectRepository,
    DIToken.ProjectModule.ProjectPersistencePort,
    DIToken.ProjectModule.ProjectQueryPort,
    DIToken.ProjectModule.CreateProjectUseCase,
    DIToken.ProjectModule.GetProjectUseCase,
    DIToken.ProjectModule.GetMyProjectsUseCase,
    DIToken.ProjectModule.UpdateProjectUseCase,
    DIToken.ProjectModule.DeleteProjectUseCase,
    DIToken.ProjectModule.AddProjectMemberUseCase,
    DIToken.ProjectModule.RemoveProjectMemberUseCase,
    DIToken.ProjectModule.UpdateProjectMemberRoleUseCase,
    DIToken.ProjectModule.UpdateProjectWorkflowUseCase,
    DIToken.ProjectModule.UpdateProjectIssueTypesUseCase,
    DIToken.ProjectModule.UpdateProjectPrioritiesUseCase,
  ],
})
export class ProjectModule {}
