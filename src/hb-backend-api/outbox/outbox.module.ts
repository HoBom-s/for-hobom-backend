import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OutboxEntity } from "./domain/entity/outbox.entity";
import { OutboxSchema } from "./domain/entity/outbox.schema";
import { DIToken } from "../../shared/di/token.di";
import { OutboxRepositoryImpl } from "./domain/repositories/outbox.repository.impl";
import { OutboxPersistenceAdapter } from "./adapters/out/persistence/outbox-persistence.adapter";
import { OutboxQueryAdapter } from "./adapters/out/query/outbox-query.adapter";
import { FindOutboxByEventTypeAndStatusService } from "./application/use-cases/find-outbox-by-event-type-and-status.service";
import { FindTodayMenuOutboxController } from "./adapters/in/grpc/find-today-menu-outbox.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: OutboxEntity.name,
        schema: OutboxSchema,
      },
    ]),
  ],
  controllers: [FindTodayMenuOutboxController],
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
  ],
  exports: [
    MongooseModule,
    DIToken.OutboxModule.OutboxRepository,
    DIToken.OutboxModule.OutboxPersistencePort,
    DIToken.OutboxModule.OutboxQueryPort,
    DIToken.OutboxModule.FindOutboxByEventTypeAndStatusUseCase,
  ],
})
export class OutboxModule {}
