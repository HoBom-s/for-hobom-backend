import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { IssueEntity } from "./domain/model/issue.entity";
import { IssueSchema } from "./domain/model/issue.schema";
import { IssueCommentEntity } from "./domain/model/issue-comment.entity";
import { IssueCommentSchema } from "./domain/model/issue-comment.schema";
import { IssueHistoryEntity } from "./domain/model/issue-history.entity";
import { IssueHistorySchema } from "./domain/model/issue-history.schema";
import { DIToken } from "../../shared/di/token.di";
import { IssueRepositoryImpl } from "./infra/repositories/issue.repository.impl";
import { IssueCommentRepositoryImpl } from "./infra/repositories/issue-comment.repository.impl";
import { IssueHistoryRepositoryImpl } from "./infra/repositories/issue-history.repository.impl";
import { IssuePersistenceAdapter } from "./adapters/out/issue-persistence.adapter";
import { IssueCommentPersistenceAdapter } from "./adapters/out/issue-comment-persistence.adapter";
import { IssueHistoryPersistenceAdapter } from "./adapters/out/issue-history-persistence.adapter";
import { IssueQueryAdapter } from "./adapters/out/issue-query.adapter";
import { IssueCommentQueryAdapter } from "./adapters/out/issue-comment-query.adapter";
import { IssueHistoryQueryAdapter } from "./adapters/out/issue-history-query.adapter";
import { IssueController } from "./adapters/in/issue.controller";
import { IssueCommentController } from "./adapters/in/issue-comment.controller";
import { IssueHistoryController } from "./adapters/in/issue-history.controller";
import { CreateIssueService } from "./application/use-cases/create-issue.service";
import { GetIssueService } from "./application/use-cases/get-issue.service";
import { GetIssuesByProjectService } from "./application/use-cases/get-issues-by-project.service";
import { UpdateIssueService } from "./application/use-cases/update-issue.service";
import { DeleteIssueService } from "./application/use-cases/delete-issue.service";
import { TransitionIssueStatusService } from "./application/use-cases/transition-issue-status.service";
import { AssignIssueService } from "./application/use-cases/assign-issue.service";
import { CreateIssueCommentService } from "./application/use-cases/create-issue-comment.service";
import { UpdateIssueCommentService } from "./application/use-cases/update-issue-comment.service";
import { DeleteIssueCommentService } from "./application/use-cases/delete-issue-comment.service";
import { GetIssueCommentsService } from "./application/use-cases/get-issue-comments.service";
import { GetIssueHistoryService } from "./application/use-cases/get-issue-history.service";
import { ProjectModule } from "../project/project.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IssueEntity.name, schema: IssueSchema },
      { name: IssueCommentEntity.name, schema: IssueCommentSchema },
      { name: IssueHistoryEntity.name, schema: IssueHistorySchema },
    ]),
    forwardRef(() => ProjectModule),
    UserModule,
  ],
  controllers: [
    IssueController,
    IssueCommentController,
    IssueHistoryController,
  ],
  providers: [
    {
      provide: DIToken.IssueModule.IssueRepository,
      useClass: IssueRepositoryImpl,
    },
    {
      provide: DIToken.IssueModule.IssueCommentRepository,
      useClass: IssueCommentRepositoryImpl,
    },
    {
      provide: DIToken.IssueModule.IssueHistoryRepository,
      useClass: IssueHistoryRepositoryImpl,
    },
    {
      provide: DIToken.IssueModule.IssuePersistencePort,
      useClass: IssuePersistenceAdapter,
    },
    {
      provide: DIToken.IssueModule.IssueCommentPersistencePort,
      useClass: IssueCommentPersistenceAdapter,
    },
    {
      provide: DIToken.IssueModule.IssueHistoryPersistencePort,
      useClass: IssueHistoryPersistenceAdapter,
    },
    {
      provide: DIToken.IssueModule.IssueQueryPort,
      useClass: IssueQueryAdapter,
    },
    {
      provide: DIToken.IssueModule.IssueCommentQueryPort,
      useClass: IssueCommentQueryAdapter,
    },
    {
      provide: DIToken.IssueModule.IssueHistoryQueryPort,
      useClass: IssueHistoryQueryAdapter,
    },
    {
      provide: DIToken.IssueModule.CreateIssueUseCase,
      useClass: CreateIssueService,
    },
    {
      provide: DIToken.IssueModule.GetIssueUseCase,
      useClass: GetIssueService,
    },
    {
      provide: DIToken.IssueModule.GetIssuesByProjectUseCase,
      useClass: GetIssuesByProjectService,
    },
    {
      provide: DIToken.IssueModule.UpdateIssueUseCase,
      useClass: UpdateIssueService,
    },
    {
      provide: DIToken.IssueModule.DeleteIssueUseCase,
      useClass: DeleteIssueService,
    },
    {
      provide: DIToken.IssueModule.TransitionIssueStatusUseCase,
      useClass: TransitionIssueStatusService,
    },
    {
      provide: DIToken.IssueModule.AssignIssueUseCase,
      useClass: AssignIssueService,
    },
    {
      provide: DIToken.IssueModule.CreateIssueCommentUseCase,
      useClass: CreateIssueCommentService,
    },
    {
      provide: DIToken.IssueModule.UpdateIssueCommentUseCase,
      useClass: UpdateIssueCommentService,
    },
    {
      provide: DIToken.IssueModule.DeleteIssueCommentUseCase,
      useClass: DeleteIssueCommentService,
    },
    {
      provide: DIToken.IssueModule.GetIssueCommentsUseCase,
      useClass: GetIssueCommentsService,
    },
    {
      provide: DIToken.IssueModule.GetIssueHistoryUseCase,
      useClass: GetIssueHistoryService,
    },
  ],
  exports: [
    MongooseModule,
    DIToken.IssueModule.IssueRepository,
    DIToken.IssueModule.IssueCommentRepository,
    DIToken.IssueModule.IssueHistoryRepository,
    DIToken.IssueModule.IssuePersistencePort,
    DIToken.IssueModule.IssueCommentPersistencePort,
    DIToken.IssueModule.IssueHistoryPersistencePort,
    DIToken.IssueModule.IssueQueryPort,
    DIToken.IssueModule.IssueCommentQueryPort,
    DIToken.IssueModule.IssueHistoryQueryPort,
    DIToken.IssueModule.CreateIssueUseCase,
    DIToken.IssueModule.GetIssueUseCase,
    DIToken.IssueModule.GetIssuesByProjectUseCase,
    DIToken.IssueModule.UpdateIssueUseCase,
    DIToken.IssueModule.DeleteIssueUseCase,
    DIToken.IssueModule.TransitionIssueStatusUseCase,
    DIToken.IssueModule.AssignIssueUseCase,
    DIToken.IssueModule.CreateIssueCommentUseCase,
    DIToken.IssueModule.UpdateIssueCommentUseCase,
    DIToken.IssueModule.DeleteIssueCommentUseCase,
    DIToken.IssueModule.GetIssueCommentsUseCase,
    DIToken.IssueModule.GetIssueHistoryUseCase,
  ],
})
export class IssueModule {}
