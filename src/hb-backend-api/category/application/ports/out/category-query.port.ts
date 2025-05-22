import { CategoryId } from "../../../domain/vo/category-id.vo";
import { CategoryEntitySchema } from "../../../domain/entity/category.entity";
import { UserId } from "../../../../user/domain/vo/user-id.vo";
import { CategoryTitle } from "../../../domain/vo/category-title.vo";

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
