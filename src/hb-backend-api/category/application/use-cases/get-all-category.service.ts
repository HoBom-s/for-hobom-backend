import { UserId } from "src/hb-backend-api/user/domain/vo/user-id.vo";
import { GetAllCategoryUseCase } from "../ports/in/get-all-category.use-case";
import { CategoryQueryResult } from "../result/category-query.result";
import { Inject, Injectable } from "@nestjs/common";
import { DIToken } from "../../../../shared/di/token.di";
import { CategoryQueryPort } from "../ports/out/category-query.port";

@Injectable()
export class GetAllCategoryService implements GetAllCategoryUseCase {
  constructor(
    @Inject(DIToken.CategoryModule.CategoryQueryPort)
    private categoryQueryPort: CategoryQueryPort,
  ) {}

  public async invoke(userId: UserId): Promise<CategoryQueryResult[]> {
    const categories = await this.categoryQueryPort.findAll(userId);
    if (categories.length === 0) {
      return [];
    }

    return categories.map(CategoryQueryResult.from);
  }
}
