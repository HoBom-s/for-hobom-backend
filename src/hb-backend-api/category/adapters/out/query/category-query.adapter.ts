import { Inject, Injectable } from "@nestjs/common";
import { CategoryId } from "src/hb-backend-api/category/domain/vo/category-id.vo";
import { CategoryQueryPort } from "../../../application/ports/out/category-query.port";
import { DIToken } from "../../../../../shared/di/token.di";
import { CategoryRepository } from "../../../domain/repositories/category.repository";
import { CategoryEntitySchema } from "../../../domain/entity/category.entity";
import { UserId } from "../../../../user/domain/vo/user-id.vo";
import { DailyTodoId } from "../../../../daily-todo/domain/vo/daily-todo-id.vo";
import { CategoryDocument } from "../../../domain/entity/category.schema";

@Injectable()
export class CategoryQueryAdapter implements CategoryQueryPort {
  constructor(
    @Inject(DIToken.CategoryModule.CategoryRepository)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  public async getById(categoryId: CategoryId): Promise<CategoryEntitySchema> {
    const category = await this.categoryRepository.findById(categoryId);

    return this.toResult(category);
  }

  public async getByTitle(title: string): Promise<CategoryEntitySchema | null> {
    const category = await this.categoryRepository.findByTitle(title);

    if (category == null) {
      return null;
    }

    return this.toResult(category);
  }

  private toResult(category: CategoryDocument): CategoryEntitySchema {
    return CategoryEntitySchema.of(
      CategoryId.fromString(String(category._id)),
      category.title,
      UserId.fromString(String(category.owner._id)),
      category.dailyTodos.map((dailyTodo) =>
        DailyTodoId.fromString(String(dailyTodo._id)),
      ),
    );
  }
}
