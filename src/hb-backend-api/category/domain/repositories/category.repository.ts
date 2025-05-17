import { CategoryCreateEntitySchema } from "../entity/category.entity";
import { CategoryId } from "../vo/category-id.vo";
import { CategoryDocument } from "../entity/category.schema";
import { UserId } from "../../../user/domain/vo/user-id.vo";
import { CategoryTitle } from "../vo/category-title.vo";

export interface CategoryRepository {
  save(categoryEntitySchema: CategoryCreateEntitySchema): Promise<void>;

  findAll(userId: UserId): Promise<CategoryDocument[]>;

  findById(id: CategoryId): Promise<CategoryDocument>;

  findByTitle(title: CategoryTitle): Promise<CategoryDocument | null>;
}
