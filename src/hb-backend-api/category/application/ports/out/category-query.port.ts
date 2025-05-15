import { CategoryId } from "../../../domain/vo/category-id.vo";
import { CategoryEntitySchema } from "../../../domain/entity/category.entity";

export interface CategoryQueryPort {
  getById(categoryId: CategoryId): Promise<CategoryEntitySchema>;

  getByTitle(title: string): Promise<CategoryEntitySchema | null>;
}
