import {
  CategoryCreateEntitySchema,
  CategoryUpdateEntitySchema,
} from "src/hb-backend-api/category/domain/model/category.entity";
import { CategoryId } from "../../model/category-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";

export interface CategoryPersistencePort {
  save(categoryEntitySchema: CategoryCreateEntitySchema): Promise<void>;

  updateOne(
    id: CategoryId,
    categoryUpdateEntitySchema: CategoryUpdateEntitySchema,
  ): Promise<void>;

  deleteOne(id: CategoryId, owner: UserId): Promise<void>;
}
