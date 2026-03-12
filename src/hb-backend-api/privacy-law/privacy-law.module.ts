import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { DIToken } from "../../shared/di/token.di";
import { LawVersionEntity } from "./domain/model/law-version.entity";
import { LawVersionSchema } from "./domain/model/law-version.schema";
import { LawDiffEntity } from "./domain/model/law-diff.entity";
import { LawDiffSchema } from "./domain/model/law-diff.schema";
import { StudyMaterialEntity } from "./domain/model/study-material.entity";
import { StudyMaterialSchema } from "./domain/model/study-material.schema";
import { PrivacyLawController } from "./adapters/in/privacy-law.controller";
import { FetchLawVersionScheduler } from "./adapters/in/fetch-law-version.scheduler";
import { LawVersionRepositoryImpl } from "./infra/repositories/law-version.repository.impl";
import { LawDiffRepositoryImpl } from "./infra/repositories/law-diff.repository.impl";
import { StudyMaterialRepositoryImpl } from "./infra/repositories/study-material.repository.impl";
import { LawApiAdapter } from "./adapters/out/law-api.adapter";
import { LlmGrpcAdapter } from "./adapters/out/llm-grpc.adapter";
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
    ]),
    ClientsModule.register([
      {
        name: "LLM_PACKAGE",
        transport: Transport.GRPC,
        options: {
          url: `${process.env.HOBOM_LLM_GRPC_HOST ?? "localhost"}:${process.env.HOBOM_LLM_GRPC_PORT ?? "50052"}`,
          package: ["llm"],
          protoPath: [
            join(
              __dirname,
              "../../../../hobom-buf-proto/llm/v1/generate-study-material.proto",
            ),
            join(
              __dirname,
              "../../../../hobom-buf-proto/llm/v1/ask-question.proto",
            ),
          ],
        },
      },
    ]),
  ],
  controllers: [PrivacyLawController],
  providers: [
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
      useClass: LlmGrpcAdapter,
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
  ],
  exports: [MongooseModule],
})
export class PrivacyLawModule {}
