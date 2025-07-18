import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FutureMessageEntity } from "./domain/model/future-message.entity";
import { FutureMessageSchema } from "./domain/model/future-message.schema";
import { DIToken } from "../../shared/di/token.di";
import { FutureMessagePersistenceRepositoryImpl } from "./domain/model/future-message-persistence.repository.impl";
import { FutureMessagePersistenceAdapter } from "./adapters/out/future-message-persistence.adapter";
import { FutureMessageQueryRepositoryImpl } from "./domain/model/future-message-query.repository.impl";
import { FutureMessageQueryAdapter } from "./adapters/out/future-message-query.adapter";
import { CreateFutureMessageService } from "./application/use-cases/create-future-message.service";
import { CreateFutureMessageController } from "./adapters/in/create-future-message.controller";
import { UserModule } from "../user/user.module";
import { FindAllFutureMessageByStatusService } from "./application/use-cases/find-all-future-message-by-status.service";
import { FindAllFutureMessageByStatusController } from "./adapters/in/find-all-future-message-by-status.controller";
import { FindFutureMessageByIdService } from "./application/use-cases/find-future-message-by-id.service";
import { FindFutureMessageByIdController } from "./adapters/in/find-future-message-by-id.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: FutureMessageEntity.name,
        schema: FutureMessageSchema,
      },
    ]),
    UserModule,
  ],
  providers: [
    {
      provide: DIToken.FutureMessageModule.FutureMessagePersistenceRepository,
      useClass: FutureMessagePersistenceRepositoryImpl,
    },
    {
      provide: DIToken.FutureMessageModule.FutureMessageQueryRepository,
      useClass: FutureMessageQueryRepositoryImpl,
    },
    {
      provide: DIToken.FutureMessageModule.FutureMessagePersistencePort,
      useClass: FutureMessagePersistenceAdapter,
    },
    {
      provide: DIToken.FutureMessageModule.FutureMessageQueryPort,
      useClass: FutureMessageQueryAdapter,
    },
    {
      provide: DIToken.FutureMessageModule.CreateFutureMessageUseCase,
      useClass: CreateFutureMessageService,
    },
    {
      provide: DIToken.FutureMessageModule.FindAllFutureMessageByStatusUseCase,
      useClass: FindAllFutureMessageByStatusService,
    },
    {
      provide: DIToken.FutureMessageModule.FindFutureMessageByIdUseCase,
      useClass: FindFutureMessageByIdService,
    },
  ],
  controllers: [
    CreateFutureMessageController,
    FindAllFutureMessageByStatusController,
    FindFutureMessageByIdController,
  ],
  exports: [
    MongooseModule,
    DIToken.FutureMessageModule.FutureMessagePersistenceRepository,
    DIToken.FutureMessageModule.FutureMessageQueryRepository,
    DIToken.FutureMessageModule.FutureMessagePersistencePort,
    DIToken.FutureMessageModule.FutureMessageQueryPort,
    DIToken.FutureMessageModule.CreateFutureMessageUseCase,
    DIToken.FutureMessageModule.FindAllFutureMessageByStatusUseCase,
    DIToken.FutureMessageModule.FindFutureMessageByIdUseCase,
  ],
})
export class FutureMessageModule {}
