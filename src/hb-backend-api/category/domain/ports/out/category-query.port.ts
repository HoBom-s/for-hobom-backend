import { CategoryId } from "../../model/category-id.vo";
import { CategoryEntitySchema } from "../../model/category.entity";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { CategoryTitle } from "../../model/category-title.vo";

export interface CategoryQueryPort {
  findById(
    categoryId: CategoryId,
    owner: UserId,
  ): Promise<CategoryEntitySchema>;

  findAll(owner: UserId): Promise<CategoryEntitySchema[]>;

  findByTitle(
    title: CategoryTitle,
    owner: UserId,
  ): Promise<CategoryEntitySchema | null>;
}
