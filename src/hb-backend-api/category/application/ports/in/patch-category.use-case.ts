import { CategoryId } from "../../../domain/vo/category-id.vo";
import { PatchCategoryCommand } from "../../command/patch-category.command";

export interface PatchCategoryUseCase {
  invoke(categoryId: CategoryId, command: PatchCategoryCommand): Promise<void>;
}
