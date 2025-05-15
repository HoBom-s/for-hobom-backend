import { CategoryCreateEntitySchema } from "../entity/category.entity";
import { CategoryId } from "../vo/category-id.vo";
import { CategoryDocument } from "../entity/category.schema";

export interface CategoryRepository {
  save(categoryEntitySchema: CategoryCreateEntitySchema): Promise<void>;

  findById(id: CategoryId): Promise<CategoryDocument>;

  findByTitle(title: string): Promise<CategoryDocument | null>;
}
