import { AuthEntity, AuthEntitySchema } from "../entity/auth.entity";
import { UserNickname } from "../../../user/domain/vo/user-nickname.vo";
import { RefreshToken } from "../vo/refresh-token.vo";

export interface AuthRepository {
  findByRefreshToken(token: RefreshToken): Promise<AuthEntity>;

  findByNickname(nickname: UserNickname): Promise<AuthEntity | null>;

  save(authEntitySchema: AuthEntitySchema): Promise<void>;

  updateRefreshToken(
    nickname: UserNickname,
    newRefreshToken: RefreshToken,
  ): Promise<void>;

  revokeToken(token: RefreshToken): Promise<void>;
}
