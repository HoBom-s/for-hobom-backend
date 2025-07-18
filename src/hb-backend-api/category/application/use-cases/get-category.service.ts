import { GetCategoryUseCase } from "../../domain/ports/in/get-category.use-case";
import { Inject, Injectable } from "@nestjs/common";
import { DIToken } from "../../../../shared/di/token.di";
import { CategoryQueryPort } from "../../domain/ports/out/category-query.port";
import { CategoryId } from "../../domain/model/category-id.vo";
import { CategoryQueryResult } from "../../domain/ports/out/category-query.result";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { CategoryEntitySchema } from "../../domain/model/category.entity";

@Injectable()
export class GetCategoryService implements GetCategoryUseCase {
  constructor(
    @Inject(DIToken.CategoryModule.CategoryQueryPort)
    private readonly categoryQueryPort: CategoryQueryPort,
  ) {}

  public async invoke(
    id: CategoryId,
    owner: UserId,
  ): Promise<CategoryQueryResult> {
    const category = await this.findById(id, owner);

    return CategoryQueryResult.from(category);
  }

  private async findById(
    id: CategoryId,
    owner: UserId,
  ): Promise<CategoryEntitySchema> {
    return await this.categoryQueryPort.findById(id, owner);
  }
}
