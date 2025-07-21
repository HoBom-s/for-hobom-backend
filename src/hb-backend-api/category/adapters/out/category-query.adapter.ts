import { Inject, Injectable } from "@nestjs/common";
import { CategoryQueryPort } from "../../domain/ports/out/category-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { CategoryRepository } from "../../domain/model/category.repository";
import { CategoryEntitySchema } from "../../domain/model/category.entity";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { DailyTodoId } from "../../../daily-todo/domain/vo/daily-todo-id.vo";
import { CategoryDocument } from "../../domain/model/category.schema";
import { CategoryTitle } from "../../domain/model/category-title.vo";
import { CategoryId } from "../../domain/model/category-id.vo";

@Injectable()
export class CategoryQueryAdapter implements CategoryQueryPort {
  constructor(
    @Inject(DIToken.CategoryModule.CategoryRepository)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  public async findById(
    categoryId: CategoryId,
    owner: UserId,
  ): Promise<CategoryEntitySchema> {
    const category = await this.categoryRepository.findById(categoryId, owner);

    return this.toResult(category);
  }

  public async findAll(owner: UserId): Promise<CategoryEntitySchema[]> {
    const categories = await this.categoryRepository.findAll(owner);
    if (categories.length === 0) {
      return [];
    }

    return categories.map(this.toResult);
  }

  public async findByTitle(
    title: CategoryTitle,
    owner: UserId,
  ): Promise<CategoryEntitySchema | null> {
    const category = await this.categoryRepository.findByTitle(title, owner);

    if (category == null) {
      return null;
    }

    return this.toResult(category);
  }

  private toResult(category: CategoryDocument): CategoryEntitySchema {
    return CategoryEntitySchema.of(
      CategoryId.fromString(String(category._id)),
      CategoryTitle.fromString(category.title),
      UserId.fromString(String(category.owner)),
      category.dailyTodos.map((dailyTodo) =>
        DailyTodoId.fromString(String(dailyTodo)),
      ),
    );
  }
}
