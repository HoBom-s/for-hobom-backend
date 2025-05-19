import { CategoryId } from "../../../domain/vo/category-id.vo";
import { UserId } from "../../../../user/domain/vo/user-id.vo";

export interface DeleteCategoryUseCase {
  invoke(id: CategoryId, owner: UserId): Promise<void>;
}
