import { Inject, Injectable } from "@nestjs/common";
import { PatchCategoryUseCase } from "../ports/in/patch-category.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { CategoryPersistencePort } from "../ports/out/category-persistence.port";
import { CategoryId } from "../../domain/vo/category-id.vo";
import { PatchCategoryCommand } from "../command/patch-category.command";
import {
  CategoryEntitySchema,
  CategoryUpdateEntitySchema,
} from "../../domain/entity/category.entity";
import { CategoryQueryPort } from "../ports/out/category-query.port";
import { UserId } from "../../../user/domain/vo/user-id.vo";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class PatchCategoryService implements PatchCategoryUseCase {
  constructor(
    @Inject(DIToken.CategoryModule.CategoryQueryPort)
    private readonly categoryQueryPort: CategoryQueryPort,
    @Inject(DIToken.CategoryModule.CategoryPersistencePort)
    private readonly categoryPersistencePort: CategoryPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(categoryId: CategoryId, command: PatchCategoryCommand) {
    const foundCategory = await this.get(categoryId, command.getOwner);
    await this.update(foundCategory.getId, command);
  }

  private async get(
    id: CategoryId,
    owner: UserId,
  ): Promise<CategoryEntitySchema> {
    return await this.categoryQueryPort.findById(id, owner);
  }

  private async update(categoryId: CategoryId, command: PatchCategoryCommand) {
    await this.categoryPersistencePort.updateOne(
      categoryId,
      CategoryUpdateEntitySchema.of(command.getTitle, command.getOwner),
    );
  }
}
