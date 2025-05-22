import { CategoryId } from "../../../domain/vo/category-id.vo";
import { CategoryQueryResult } from "../../result/category-query.result";
import { UserId } from "../../../../user/domain/vo/user-id.vo";

export interface GetCategoryUseCase {
  invoke(id: CategoryId, owner: UserId): Promise<CategoryQueryResult>;
}
