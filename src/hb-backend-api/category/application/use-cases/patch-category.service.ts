import { Inject, Injectable } from "@nestjs/common";
import { PatchCategoryUseCase } from "../ports/in/patch-category.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { CategoryPersistencePort } from "../ports/out/category-persistence.port";
import { CategoryId } from "../../domain/vo/category-id.vo";
import { PatchCategoryCommand } from "../command/patch-category.command";
import { CategoryUpdateEntitySchema } from "../../domain/entity/category.entity";

@Injectable()
export class PatchCategoryService implements PatchCategoryUseCase {
  constructor(
    @Inject(DIToken.CategoryModule.CategoryPersistencePort)
    private readonly categoryPersistencePort: CategoryPersistencePort,
  ) {}

  public async invoke(categoryId: CategoryId, command: PatchCategoryCommand) {
    await this.categoryPersistencePort.updateOne(
      categoryId,
      CategoryUpdateEntitySchema.of(command.getTitle, command.getOwner),
    );
  }
}
