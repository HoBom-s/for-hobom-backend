import { Inject, Injectable } from "@nestjs/common";
import { DeleteCategoryUseCase } from "../ports/in/delete-category.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { CategoryPersistencePort } from "../ports/out/category-persistence.port";
import { UserId } from "src/hb-backend-api/user/domain/vo/user-id.vo";
import { CategoryId } from "../../domain/vo/category-id.vo";

@Injectable()
export class DeleteCategoryService implements DeleteCategoryUseCase {
  constructor(
    @Inject(DIToken.CategoryModule.CategoryPersistencePort)
    private readonly categoryPersistencePort: CategoryPersistencePort,
  ) {}

  public async invoke(id: CategoryId, owner: UserId): Promise<void> {
    await this.categoryPersistencePort.deleteOne(id, owner);
  }
}
