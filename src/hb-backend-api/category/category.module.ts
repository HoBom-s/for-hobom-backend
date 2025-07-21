import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CategoryEntity } from "./domain/model/category.entity";
import { CategorySchema } from "./domain/model/category.schema";
import { DailyTodoModule } from "../daily-todo/daily-todo.module";
import { DIToken } from "../../shared/di/token.di";
import { CategoryRepositoryImpl } from "./infra/repositories/category.repository.impl";
import { CategoryPersistenceAdapter } from "./adapters/out/category-persistence.adapter";
import { DeleteCategoryByIdController } from "./adapters/in/delete-category-by-id.controller";
import { CreateCategoryService } from "./application/use-cases/create-category.service";
import { CategoryQueryAdapter } from "./adapters/out/category-query.adapter";
import { UserModule } from "../user/user.module";
import { GetAllCategoryService } from "./application/use-cases/get-all-category.service";
import { PatchCategoryService } from "./application/use-cases/patch-category.service";
import { GetCategoryService } from "./application/use-cases/get-category.service";
import { DeleteCategoryService } from "./application/use-cases/delete-category.service";
import { CreateCategoryController } from "./adapters/in/create-category.controller";
import { GetAllCategoryController } from "./adapters/in/get-all-category.controller";
import { GetCategoryByIdController } from "./adapters/in/get-category-by-id.controller";
import { UpdateCategoryTitleController } from "./adapters/in/update-category-title.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CategoryEntity.name,
        schema: CategorySchema,
      },
    ]),
    DailyTodoModule,
    UserModule,
  ],
  controllers: [
    CreateCategoryController,
    DeleteCategoryByIdController,
    GetAllCategoryController,
    GetCategoryByIdController,
    UpdateCategoryTitleController,
  ],
  providers: [
    {
      provide: DIToken.CategoryModule.CategoryRepository,
      useClass: CategoryRepositoryImpl,
    },
    {
      provide: DIToken.CategoryModule.CategoryPersistencePort,
      useClass: CategoryPersistenceAdapter,
    },
    {
      provide: DIToken.CategoryModule.CategoryQueryPort,
      useClass: CategoryQueryAdapter,
    },
    {
      provide: DIToken.CategoryModule.CreateCategoryUseCase,
      useClass: CreateCategoryService,
    },
    {
      provide: DIToken.CategoryModule.GetAllCategoryUseCase,
      useClass: GetAllCategoryService,
    },
    {
      provide: DIToken.CategoryModule.GetCategoryUseCase,
      useClass: GetCategoryService,
    },
    {
      provide: DIToken.CategoryModule.PatchCategoryUseCase,
      useClass: PatchCategoryService,
    },
    {
      provide: DIToken.CategoryModule.DeleteCategoryUseCase,
      useClass: DeleteCategoryService,
    },
  ],
  exports: [
    MongooseModule,
    DIToken.CategoryModule.CategoryRepository,
    DIToken.CategoryModule.CategoryPersistencePort,
    DIToken.CategoryModule.CategoryQueryPort,
    DIToken.CategoryModule.CreateCategoryUseCase,
    DIToken.CategoryModule.GetCategoryUseCase,
    DIToken.CategoryModule.GetAllCategoryUseCase,
    DIToken.CategoryModule.PatchCategoryUseCase,
    DIToken.CategoryModule.DeleteCategoryUseCase,
  ],
})
export class CategoryModule {}
