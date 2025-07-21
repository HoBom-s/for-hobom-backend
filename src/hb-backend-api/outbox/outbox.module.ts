import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OutboxEntity } from "./domain/model/outbox.entity";
import { OutboxSchema } from "./domain/model/outbox.schema";
import { DIToken } from "../../shared/di/token.di";
import { OutboxRepositoryImpl } from "./domain/model/outbox.repository.impl";
import { OutboxPersistenceAdapter } from "./adapters/out/outbox-persistence.adapter";
import { OutboxQueryAdapter } from "./adapters/out/outbox-query.adapter";
import { FindOutboxByEventTypeAndStatusService } from "./application/use-cases/find-outbox-by-event-type-and-status.service";
import { FindMessageOutboxController } from "./adapters/in/find-message-outbox.controller";
import { PatchOutboxMarkAsSentService } from "./application/use-cases/patch-outbox-mark-as-sent.service";
import { PatchMessageOutboxMarkAsSentController } from "./adapters/in/patch-message-outbox-mark-as-sent.controller";
import { FindLogOutboxByEventTypeAndStatusService } from "./application/use-cases/find-log-outbox-by-event-type-and-status.service";
import { FindLogOutboxController } from "./adapters/in/find-log-outbox.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: OutboxEntity.name,
        schema: OutboxSchema,
      },
    ]),
  ],
  controllers: [
    FindMessageOutboxController,
    FindLogOutboxController,
    PatchMessageOutboxMarkAsSentController,
  ],
  providers: [
    {
      provide: DIToken.OutboxModule.OutboxRepository,
      useClass: OutboxRepositoryImpl,
    },
    {
      provide: DIToken.OutboxModule.OutboxPersistencePort,
      useClass: OutboxPersistenceAdapter,
    },
    {
      provide: DIToken.OutboxModule.OutboxQueryPort,
      useClass: OutboxQueryAdapter,
    },
    {
      provide: DIToken.OutboxModule.FindOutboxByEventTypeAndStatusUseCase,
      useClass: FindOutboxByEventTypeAndStatusService,
    },
    {
      provide: DIToken.OutboxModule.FindLogOutboxByEventTypeAndStatusUseCase,
      useClass: FindLogOutboxByEventTypeAndStatusService,
    },
    {
      provide: DIToken.OutboxModule.PatchOutboxMarkAsSentUseCase,
      useClass: PatchOutboxMarkAsSentService,
    },
  ],
  exports: [
    MongooseModule,
    DIToken.OutboxModule.OutboxRepository,
    DIToken.OutboxModule.OutboxPersistencePort,
    DIToken.OutboxModule.OutboxQueryPort,
    DIToken.OutboxModule.FindOutboxByEventTypeAndStatusUseCase,
    DIToken.OutboxModule.PatchOutboxMarkAsSentUseCase,
    DIToken.OutboxModule.FindLogOutboxByEventTypeAndStatusUseCase,
  ],
})
export class OutboxModule {}
