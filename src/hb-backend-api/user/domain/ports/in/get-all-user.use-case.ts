import { UserQueryResult } from "../out/user-query.result";

export interface GetAllUserUseCase {
  invoke(): Promise<UserQueryResult[]>;
}
