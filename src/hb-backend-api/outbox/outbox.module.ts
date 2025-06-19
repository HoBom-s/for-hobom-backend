import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OutboxEntity } from "./domain/entity/outbox.entity";
import { OutboxSchema } from "./domain/entity/outbox.schema";
import { DIToken } from "../../shared/di/token.di";
import { OutboxRepositoryImpl } from "./domain/repositories/outbox.repository.impl";
import { OutboxPersistenceAdapter } from "./adapters/out/persistence/outbox-persistence.adapter";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: OutboxEntity.name,
        schema: OutboxSchema,
      },
    ]),
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
  ],
  exports: [
    MongooseModule,
    DIToken.OutboxModule.OutboxRepository,
    DIToken.OutboxModule.OutboxPersistencePort,
  ],
})
export class OutboxModule {}
