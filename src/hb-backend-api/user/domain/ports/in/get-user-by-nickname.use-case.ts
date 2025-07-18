import { UserNickname } from "../../model/user-nickname.vo";
import { UserQueryResult } from "../out/user-query.result";

export interface GetUserByNicknameUseCase {
  invoke(nickname: UserNickname): Promise<UserQueryResult>;
}
