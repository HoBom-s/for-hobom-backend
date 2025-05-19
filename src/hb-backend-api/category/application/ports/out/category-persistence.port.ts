import {
  CategoryCreateEntitySchema,
  CategoryUpdateEntitySchema,
} from "src/hb-backend-api/category/domain/entity/category.entity";
import { CategoryId } from "../../../domain/vo/category-id.vo";

export interface CategoryPersistencePort {
  save(categoryEntitySchema: CategoryCreateEntitySchema): Promise<void>;

  updateOne(
    id: CategoryId,
    categoryUpdateEntitySchema: CategoryUpdateEntitySchema,
  ): Promise<void>;
}
