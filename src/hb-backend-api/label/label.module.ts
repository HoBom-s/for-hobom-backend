import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LabelEntity } from "./domain/model/label.entity";
import { LabelSchema } from "./domain/model/label.schema";
import { DIToken } from "../../shared/di/token.di";
import { UserModule } from "../user/user.module";
import { LabelRepositoryImpl } from "./infra/repositories/label.repository.impl";
import { LabelPersistenceAdapter } from "./adapters/out/label-persistence.adapter";
import { LabelQueryAdapter } from "./adapters/out/label-query.adapter";
import { LabelController } from "./adapters/in/label.controller";
import { CreateLabelService } from "./application/use-cases/create-label.service";
import { GetAllLabelsService } from "./application/use-cases/get-all-labels.service";
import { GetLabelService } from "./application/use-cases/get-label.service";
import { PatchLabelService } from "./application/use-cases/patch-label.service";
import { DeleteLabelService } from "./application/use-cases/delete-label.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LabelEntity.name,
        schema: LabelSchema,
      },
    ]),
    UserModule,
  ],
  controllers: [LabelController],
  providers: [
    {
      provide: DIToken.LabelModule.LabelRepository,
      useClass: LabelRepositoryImpl,
    },
    {
      provide: DIToken.LabelModule.LabelPersistencePort,
      useClass: LabelPersistenceAdapter,
    },
    {
      provide: DIToken.LabelModule.LabelQueryPort,
      useClass: LabelQueryAdapter,
    },
    {
      provide: DIToken.LabelModule.CreateLabelUseCase,
      useClass: CreateLabelService,
    },
    {
      provide: DIToken.LabelModule.GetAllLabelsUseCase,
      useClass: GetAllLabelsService,
    },
    {
      provide: DIToken.LabelModule.GetLabelUseCase,
      useClass: GetLabelService,
    },
    {
      provide: DIToken.LabelModule.PatchLabelUseCase,
      useClass: PatchLabelService,
    },
    {
      provide: DIToken.LabelModule.DeleteLabelUseCase,
      useClass: DeleteLabelService,
    },
  ],
  exports: [
    MongooseModule,
    DIToken.LabelModule.LabelRepository,
    DIToken.LabelModule.LabelPersistencePort,
    DIToken.LabelModule.LabelQueryPort,
    DIToken.LabelModule.CreateLabelUseCase,
    DIToken.LabelModule.GetAllLabelsUseCase,
    DIToken.LabelModule.GetLabelUseCase,
    DIToken.LabelModule.PatchLabelUseCase,
    DIToken.LabelModule.DeleteLabelUseCase,
  ],
})
export class LabelModule {}
