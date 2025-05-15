import { CategoryCreateEntitySchema } from "src/hb-backend-api/category/domain/entity/category.entity";

export interface CategoryPersistencePort {
  save(categoryEntitySchema: CategoryCreateEntitySchema): Promise<void>;
}
