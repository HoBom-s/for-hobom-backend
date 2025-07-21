import {
  CategoryCreateEntitySchema,
  CategoryUpdateEntitySchema,
} from "./category.entity";
import { CategoryId } from "./category-id.vo";
import { CategoryDocument } from "./category.schema";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { CategoryTitle } from "./category-title.vo";

export interface CategoryRepository {
  save(categoryEntitySchema: CategoryCreateEntitySchema): Promise<void>;

  findAll(userId: UserId): Promise<CategoryDocument[]>;

  findById(id: CategoryId, owner: UserId): Promise<CategoryDocument>;

  findByTitle(
    title: CategoryTitle,
    owner: UserId,
  ): Promise<CategoryDocument | null>;

  updateTitle(
    categoryId: CategoryId,
    categoryUpdateEntitySchema: CategoryUpdateEntitySchema,
  ): Promise<void>;

  deleteOne(categoryId: CategoryId, owner: UserId): Promise<void>;
}
