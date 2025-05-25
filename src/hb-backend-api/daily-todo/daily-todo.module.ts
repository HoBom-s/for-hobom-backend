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
import { DailyTodoQueryAdapter } from "./adapters/out/query/daily-todo-query.adapter";
import { GetAllDailyTodoService } from "./application/use-cases/get-all-daily-todo.service";
import { GetDailyTodoService } from "./application/use-cases/get-daily-todo.service";
import { UpdateDailyTodoCompleteStatusService } from "./application/use-cases/update-daily-todo-complete-status.service";
import { UpdateDailyTodoCycleService } from "./application/result/update-daily-todo-cycle.service";

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
      provide: DIToken.DailyTodoModule.DailyTodoQueryPort,
      useClass: DailyTodoQueryAdapter,
    },
    {
      provide: DIToken.DailyTodoModule.CreateDailyTodoUseCase,
      useClass: CreateDailyTodoService,
    },
    {
      provide: DIToken.DailyTodoModule.GetAllDailyTodoUseCase,
      useClass: GetAllDailyTodoService,
    },
    {
      provide: DIToken.DailyTodoModule.GetDailyTodoUseCase,
      useClass: GetDailyTodoService,
    },
    {
      provide: DIToken.DailyTodoModule.UpdateDailyTodoCompleteStatusUseCase,
      useClass: UpdateDailyTodoCompleteStatusService,
    },
    {
      provide: DIToken.DailyTodoModule.UpdateDailyTodoCycleUseCase,
      useClass: UpdateDailyTodoCycleService,
    },
  ],
  controllers: [DailyTodoController],
  exports: [
    MongooseModule,
    DIToken.DailyTodoModule.DailyTodoRepository,
    DIToken.DailyTodoModule.DailyTodoPersistencePort,
    DIToken.DailyTodoModule.DailyTodoQueryPort,
    DIToken.DailyTodoModule.CreateDailyTodoUseCase,
    DIToken.DailyTodoModule.GetAllDailyTodoUseCase,
    DIToken.DailyTodoModule.GetDailyTodoUseCase,
    DIToken.DailyTodoModule.UpdateDailyTodoCompleteStatusUseCase,
    DIToken.DailyTodoModule.UpdateDailyTodoCycleUseCase,
  ],
})
export class DailyTodoModule {}
