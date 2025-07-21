import { CategoryId } from "../../model/category-id.vo";
import { CategoryQueryResult } from "../out/category-query.result";
import { UserId } from "../../../../user/domain/model/user-id.vo";

export interface GetCategoryUseCase {
  invoke(id: CategoryId, owner: UserId): Promise<CategoryQueryResult>;
}
