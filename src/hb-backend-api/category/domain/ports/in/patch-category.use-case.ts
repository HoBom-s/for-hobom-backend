import { CategoryId } from "../../model/category-id.vo";
import { PatchCategoryCommand } from "../out/patch-category.command";

export interface PatchCategoryUseCase {
  invoke(categoryId: CategoryId, command: PatchCategoryCommand): Promise<void>;
}
