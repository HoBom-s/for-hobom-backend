import { UserQueryResult } from "../../result/user-query.result";
import { UserId } from "../../../domain/vo/user-id.vo";

export interface GetUserUseCase {
  invoke(id: UserId): Promise<UserQueryResult>;
}
