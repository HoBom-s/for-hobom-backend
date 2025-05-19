import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CategoryEntity } from "./domain/entity/category.entity";
import { CategorySchema } from "./domain/entity/category.schema";
import { DailyTodoModule } from "../daily-todo/daily-todo.module";
import { DIToken } from "../../shared/di/token.di";
import { CategoryRepositoryImpl } from "./infra/repositories/category.repository.impl";
import { CategoryPersistenceAdapter } from "./adapters/out/persistence/category-persistence.adapter";
import { CategoryController } from "./adapters/in/rest/category.controller";
import { CreateCategoryService } from "./application/use-cases/create-category.service";
import { CategoryQueryAdapter } from "./adapters/out/query/category-query.adapter";
import { UserModule } from "../user/user.module";
import { GetAllCategoryService } from "./application/use-cases/get-all-category.service";
import { PatchCategoryService } from "./application/use-cases/patch-category.service";
import { GetCategoryService } from "./application/use-cases/get-category.service";

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
  controllers: [CategoryController],
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
  ],
})
export class CategoryModule {}
