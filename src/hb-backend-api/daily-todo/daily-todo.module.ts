import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DailyTodoEntity } from "./domain/entity/daily-todo.entity";
import { DailyTodoSchema } from "./domain/entity/daily-todo.schema";
import { UserModule } from "../user/user.module";
import { DailyTodoController } from "./adapters/in/rest/daily-todo.controller";
import { DIToken } from "../../shared/di/token.di";
import { DailyTodoRepositoryImpl } from "./infra/repositories/daily-todo.repository.impl";
import { DailyTodoPersistenceAdapter } from "./adapters/out/persistence/daily-todo-persistence.adapter";
import { CreateDailyTodoService } from "./application/use-cases/create-daily-todo.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DailyTodoEntity.name,
        schema: DailyTodoSchema,
      },
    ]),
    UserModule,
  ],
  providers: [
    {
      provide: DIToken.DailyTodoModule.DailyTodoRepository,
      useClass: DailyTodoRepositoryImpl,
    },
    {
      provide: DIToken.DailyTodoModule.DailyTodoPersistencePort,
      useClass: DailyTodoPersistenceAdapter,
    },
    {
      provide: DIToken.DailyTodoModule.CreateDailyTodoUseCase,
      useClass: CreateDailyTodoService,
    },
  ],
  controllers: [DailyTodoController],
  exports: [
    MongooseModule,
    DIToken.DailyTodoModule.DailyTodoRepository,
    DIToken.DailyTodoModule.DailyTodoPersistencePort,
    DIToken.DailyTodoModule.CreateDailyTodoUseCase,
  ],
})
export class DailyTodoModule {}
