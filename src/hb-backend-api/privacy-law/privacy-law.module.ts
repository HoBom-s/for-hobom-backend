import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DIToken } from "../../shared/di/token.di";
import { TraceContext } from "../../shared/trace/trace.context";
import { LawVersionEntity } from "./domain/model/law-version.entity";
import { LawVersionSchema } from "./domain/model/law-version.schema";
import { LawDiffEntity } from "./domain/model/law-diff.entity";
import { LawDiffSchema } from "./domain/model/law-diff.schema";
import { StudyMaterialEntity } from "./domain/model/study-material.entity";
import { StudyMaterialSchema } from "./domain/model/study-material.schema";
import { QuestionHistoryEntity } from "./domain/model/question-history.entity";
import { QuestionHistorySchema } from "./domain/model/question-history.schema";
import { OutboxModule } from "../outbox/outbox.module";
import { PrivacyLawController } from "./adapters/in/privacy-law.controller";
import { SaveStudyMaterialGrpcController } from "./adapters/in/save-study-material.grpc-controller";
import { FetchLawVersionScheduler } from "./adapters/in/fetch-law-version.scheduler";
import { LawVersionRepositoryImpl } from "./infra/repositories/law-version.repository.impl";
import { LawDiffRepositoryImpl } from "./infra/repositories/law-diff.repository.impl";
import { StudyMaterialRepositoryImpl } from "./infra/repositories/study-material.repository.impl";
import { LawApiAdapter } from "./adapters/out/law-api.adapter";
import { LlmRestAdapter } from "./adapters/out/llm-rest.adapter";
import { LawVersionPersistenceAdapter } from "./adapters/out/law-version-persistence.adapter";
import { LawVersionQueryAdapter } from "./adapters/out/law-version-query.adapter";
import { LawDiffPersistenceAdapter } from "./adapters/out/law-diff-persistence.adapter";
import { LawDiffQueryAdapter } from "./adapters/out/law-diff-query.adapter";
import { StudyMaterialPersistenceAdapter } from "./adapters/out/study-material-persistence.adapter";
import { StudyMaterialQueryAdapter } from "./adapters/out/study-material-query.adapter";
import { FetchLawVersionService } from "./application/use-cases/fetch-law-version.service";
import { GetLawVersionsService } from "./application/use-cases/get-law-versions.service";
import { GetLawVersionByIdService } from "./application/use-cases/get-law-version-by-id.service";
import { GetLawDiffsService } from "./application/use-cases/get-law-diffs.service";
import { GetLawDiffByIdService } from "./application/use-cases/get-law-diff-by-id.service";
import { GetStudyMaterialsService } from "./application/use-cases/get-study-materials.service";
import { GetStudyMaterialByIdService } from "./application/use-cases/get-study-material-by-id.service";
import { AskQuestionService } from "./application/use-cases/ask-question.service";
import { GetQuestionHistoriesService } from "./application/use-cases/get-question-histories.service";
import { QuestionHistoryRepositoryImpl } from "./infra/repositories/question-history.repository.impl";
import { QuestionHistoryPersistenceAdapter } from "./adapters/out/question-history-persistence.adapter";
import { QuestionHistoryQueryAdapter } from "./adapters/out/question-history-query.adapter";
import { ExamSetEntity } from "./domain/model/exam-set.entity";
import { ExamSetSchema } from "./domain/model/exam-set.schema";
import { ExamSetRepositoryImpl } from "./infra/repositories/exam-set.repository.impl";
import { ExamSetPersistenceAdapter } from "./adapters/out/exam-set-persistence.adapter";
import { ExamSetQueryAdapter } from "./adapters/out/exam-set-query.adapter";
import { LlmExamAdapter } from "./adapters/out/llm-exam.adapter";
import { GenerateExamService } from "./application/use-cases/generate-exam.service";
import { GetExamSetsService } from "./application/use-cases/get-exam-sets.service";
import { GetExamSetByIdService } from "./application/use-cases/get-exam-set-by-id.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LawVersionEntity.name,
        schema: LawVersionSchema,
      },
      {
        name: LawDiffEntity.name,
        schema: LawDiffSchema,
      },
      {
        name: StudyMaterialEntity.name,
        schema: StudyMaterialSchema,
      },
      {
        name: QuestionHistoryEntity.name,
        schema: QuestionHistorySchema,
      },
      {
        name: ExamSetEntity.name,
        schema: ExamSetSchema,
      },
    ]),
    OutboxModule,
  ],
  controllers: [PrivacyLawController, SaveStudyMaterialGrpcController],
  providers: [
    TraceContext,
    FetchLawVersionScheduler,
    {
      provide: DIToken.PrivacyLawModule.LawVersionRepository,
      useClass: LawVersionRepositoryImpl,
    },
    {
      provide: DIToken.PrivacyLawModule.LawDiffRepository,
      useClass: LawDiffRepositoryImpl,
    },
    {
      provide: DIToken.PrivacyLawModule.StudyMaterialRepository,
      useClass: StudyMaterialRepositoryImpl,
    },
    {
      provide: DIToken.PrivacyLawModule.LawApiPort,
      useClass: LawApiAdapter,
    },
    {
      provide: DIToken.PrivacyLawModule.LlmPort,
      useClass: LlmRestAdapter,
    },
    {
      provide: DIToken.PrivacyLawModule.LawVersionPersistencePort,
      useClass: LawVersionPersistenceAdapter,
    },
    {
      provide: DIToken.PrivacyLawModule.LawVersionQueryPort,
      useClass: LawVersionQueryAdapter,
    },
    {
      provide: DIToken.PrivacyLawModule.LawDiffPersistencePort,
      useClass: LawDiffPersistenceAdapter,
    },
    {
      provide: DIToken.PrivacyLawModule.LawDiffQueryPort,
      useClass: LawDiffQueryAdapter,
    },
    {
      provide: DIToken.PrivacyLawModule.StudyMaterialPersistencePort,
      useClass: StudyMaterialPersistenceAdapter,
    },
    {
      provide: DIToken.PrivacyLawModule.StudyMaterialQueryPort,
      useClass: StudyMaterialQueryAdapter,
    },
    {
      provide: DIToken.PrivacyLawModule.FetchLawVersionUseCase,
      useClass: FetchLawVersionService,
    },
    {
      provide: DIToken.PrivacyLawModule.GetLawVersionsUseCase,
      useClass: GetLawVersionsService,
    },
    {
      provide: DIToken.PrivacyLawModule.GetLawVersionByIdUseCase,
      useClass: GetLawVersionByIdService,
    },
    {
      provide: DIToken.PrivacyLawModule.GetLawDiffsUseCase,
      useClass: GetLawDiffsService,
    },
    {
      provide: DIToken.PrivacyLawModule.GetLawDiffByIdUseCase,
      useClass: GetLawDiffByIdService,
    },
    {
      provide: DIToken.PrivacyLawModule.GetStudyMaterialsUseCase,
      useClass: GetStudyMaterialsService,
    },
    {
      provide: DIToken.PrivacyLawModule.GetStudyMaterialByIdUseCase,
      useClass: GetStudyMaterialByIdService,
    },
    {
      provide: DIToken.PrivacyLawModule.AskQuestionUseCase,
      useClass: AskQuestionService,
    },
    {
      provide: DIToken.PrivacyLawModule.QuestionHistoryRepository,
      useClass: QuestionHistoryRepositoryImpl,
    },
    {
      provide: DIToken.PrivacyLawModule.QuestionHistoryPersistencePort,
      useClass: QuestionHistoryPersistenceAdapter,
    },
    {
      provide: DIToken.PrivacyLawModule.QuestionHistoryQueryPort,
      useClass: QuestionHistoryQueryAdapter,
    },
    {
      provide: DIToken.PrivacyLawModule.GetQuestionHistoriesUseCase,
      useClass: GetQuestionHistoriesService,
    },
    {
      provide: DIToken.PrivacyLawModule.ExamSetRepository,
      useClass: ExamSetRepositoryImpl,
    },
    {
      provide: DIToken.PrivacyLawModule.LlmExamPort,
      useClass: LlmExamAdapter,
    },
    {
      provide: DIToken.PrivacyLawModule.ExamSetPersistencePort,
      useClass: ExamSetPersistenceAdapter,
    },
    {
      provide: DIToken.PrivacyLawModule.ExamSetQueryPort,
      useClass: ExamSetQueryAdapter,
    },
    {
      provide: DIToken.PrivacyLawModule.GenerateExamUseCase,
      useClass: GenerateExamService,
    },
    {
      provide: DIToken.PrivacyLawModule.GetExamSetsUseCase,
      useClass: GetExamSetsService,
    },
    {
      provide: DIToken.PrivacyLawModule.GetExamSetByIdUseCase,
      useClass: GetExamSetByIdService,
    },
  ],
  exports: [MongooseModule],
})
export class PrivacyLawModule {}
