import { Inject, Injectable } from "@nestjs/common";
import {
  CategoryCreateEntitySchema,
  CategoryUpdateEntitySchema,
} from "src/hb-backend-api/category/domain/entity/category.entity";
import { CategoryPersistencePort } from "../../../application/ports/out/category-persistence.port";
import { DIToken } from "../../../../../shared/di/token.di";
import { CategoryRepository } from "../../../domain/repositories/category.repository";
import { CategoryId } from "src/hb-backend-api/category/domain/vo/category-id.vo";
import { UserId } from "../../../../user/domain/vo/user-id.vo";

@Injectable()
export class CategoryPersistenceAdapter implements CategoryPersistencePort {
  constructor(
    @Inject(DIToken.CategoryModule.CategoryRepository)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  public async save(
    categoryEntitySchema: CategoryCreateEntitySchema,
  ): Promise<void> {
    await this.categoryRepository.save(categoryEntitySchema);
  }

  public async updateOne(
    id: CategoryId,
    categoryUpdateEntitySchema: CategoryUpdateEntitySchema,
  ): Promise<void> {
    await this.categoryRepository.updateTitle(id, categoryUpdateEntitySchema);
  }

  public async deleteOne(id: CategoryId, owner: UserId): Promise<void> {
    await this.categoryRepository.deleteOne(id, owner);
  }
}
