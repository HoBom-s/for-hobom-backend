import { UserQueryResult } from "../out/user-query.result";
import { UserId } from "../../model/user-id.vo";

export interface GetUserUseCase {
  invoke(id: UserId): Promise<UserQueryResult>;
}
