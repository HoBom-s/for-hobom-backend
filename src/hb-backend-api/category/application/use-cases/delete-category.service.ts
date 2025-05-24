import { Inject, Injectable } from "@nestjs/common";
import { DeleteCategoryUseCase } from "../ports/in/delete-category.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { CategoryPersistencePort } from "../ports/out/category-persistence.port";
import { UserId } from "src/hb-backend-api/user/domain/vo/user-id.vo";
import { CategoryId } from "../../domain/vo/category-id.vo";
import { CategoryQueryPort } from "../ports/out/category-query.port";
import { CategoryEntitySchema } from "../../domain/entity/category.entity";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class DeleteCategoryService implements DeleteCategoryUseCase {
  constructor(
    @Inject(DIToken.CategoryModule.CategoryQueryPort)
    private readonly categoryQueryPort: CategoryQueryPort,
    @Inject(DIToken.CategoryModule.CategoryPersistencePort)
    private readonly categoryPersistencePort: CategoryPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(id: CategoryId, owner: UserId): Promise<void> {
    const foundCategory = await this.get(id, owner);
    await this.delete(foundCategory.getId, foundCategory.getOwner);
  }

  private async get(
    id: CategoryId,
    owner: UserId,
  ): Promise<CategoryEntitySchema> {
    return await this.categoryQueryPort.findById(id, owner);
  }

  private async delete(id: CategoryId, owner: UserId): Promise<void> {
    return this.categoryPersistencePort.deleteOne(id, owner);
  }
}
