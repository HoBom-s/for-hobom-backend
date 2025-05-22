import { UserId } from "../../../../user/domain/vo/user-id.vo";
import { CategoryQueryResult } from "../../result/category-query.result";

export interface GetAllCategoryUseCase {
  invoke(userId: UserId): Promise<CategoryQueryResult[]>;
}
