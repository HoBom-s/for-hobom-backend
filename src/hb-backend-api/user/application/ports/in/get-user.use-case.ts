import { UserQueryResult } from "../../result/user-query.result";

export interface GetUserUseCase {
  invoke(id: string): Promise<UserQueryResult>;
}
