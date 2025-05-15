import { Inject, Injectable } from "@nestjs/common";
import { CategoryCreateEntitySchema } from "src/hb-backend-api/category/domain/entity/category.entity";
import { CategoryPersistencePort } from "../../../application/ports/out/category-persistence.port";
import { DIToken } from "../../../../../shared/di/token.di";
import { CategoryRepository } from "../../../domain/repositories/category.repository";

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
}
