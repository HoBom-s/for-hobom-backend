import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DailyTodoEntity } from "./domain/entity/daily-todo.entity";
import { DailyTodoSchema } from "./domain/entity/daily-todo.schema";
import { UserModule } from "../user/user.module";
import { UpdateDailyTodoReactionController } from "./adapters/in/rest/update-daily-todo-reaction.controller";
import { DIToken } from "../../shared/di/token.di";
import { DailyTodoRepositoryImpl } from "./infra/repositories/daily-todo.repository.impl";
import { DailyTodoPersistenceAdapter } from "./adapters/out/persistence/daily-todo-persistence.adapter";
import { CreateDailyTodoService } from "./application/use-cases/create-daily-todo.service";
import { DailyTodoQueryAdapter } from "./adapters/out/query/daily-todo-query.adapter";
import { GetAllDailyTodoService } from "./application/use-cases/get-all-daily-todo.service";
import { GetDailyTodoService } from "./application/use-cases/get-daily-todo.service";
import { UpdateDailyTodoCompleteStatusService } from "./application/use-cases/update-daily-todo-complete-status.service";
import { UpdateDailyTodoCycleService } from "./application/use-cases/update-daily-todo-cycle.service";
import { UpdateDailyTodoReactionService } from "./application/use-cases/update-daily-todo-reaction.service";
import { GetDailyTodoByDateService } from "./application/use-cases/get-daily-todo-by-date.service";
import { CreateDailyTodoController } from "./adapters/in/rest/create-daily-todo.controller";
import { GetAllDailyTodoByDateController } from "./adapters/in/rest/gat-all-daily-todo-by-date.controller";
import { GetDailyTodoByIdController } from "./adapters/in/rest/gat-daily-todo-by-id.controller";
import { GetAllDailyTodoController } from "./adapters/in/rest/get-all-daily-todo.controller";
import { UpdateDailyTodoCompleteStatusController } from "./adapters/in/rest/update-daily-todo-complete-status.controller";
import { UpdateDailyTodoCycleStatusController } from "./adapters/in/rest/update-daily-todo-cycle-status.controller";
import { DeleteDailyTodoService } from "./application/use-cases/delete-daily-todo.service";
import { DeleteDailyTodoController } from "./adapters/in/rest/delete-daily-todo.controller";

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
    {
      provide: DIToken.DailyTodoModule.UpdateDailyTodoReactionUseCase,
      useClass: UpdateDailyTodoReactionService,
    },
    {
      provide: DIToken.DailyTodoModule.GetDailyTodoByDateUseCase,
      useClass: GetDailyTodoByDateService,
    },
    {
      provide: DIToken.DailyTodoModule.DeleteDailyTodoUseCase,
      useClass: DeleteDailyTodoService,
    },
  ],
  controllers: [
    CreateDailyTodoController,
    GetAllDailyTodoByDateController,
    GetDailyTodoByIdController,
    GetAllDailyTodoController,
    UpdateDailyTodoCompleteStatusController,
    UpdateDailyTodoCycleStatusController,
    UpdateDailyTodoReactionController,
    DeleteDailyTodoController,
  ],
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
    DIToken.DailyTodoModule.UpdateDailyTodoReactionUseCase,
    DIToken.DailyTodoModule.GetDailyTodoByDateUseCase,
    DIToken.DailyTodoModule.DeleteDailyTodoUseCase,
  ],
})
export class DailyTodoModule {}
