import { CategoryId } from "../../model/category-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";

export interface DeleteCategoryUseCase {
  invoke(id: CategoryId, owner: UserId): Promise<void>;
}
