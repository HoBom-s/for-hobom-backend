import { UserNickname } from "../../../domain/vo/user-nickname.vo";
import { UserQueryResult } from "../../result/user-query.result";

export interface GetUserByNicknameUseCase {
  invoke(nickname: UserNickname): Promise<UserQueryResult>;
}
