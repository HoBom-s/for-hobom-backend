import { UserId } from "../../../../user/domain/model/user-id.vo";
import { CategoryQueryResult } from "../out/category-query.result";

export interface GetAllCategoryUseCase {
  invoke(userId: UserId): Promise<CategoryQueryResult[]>;
}
