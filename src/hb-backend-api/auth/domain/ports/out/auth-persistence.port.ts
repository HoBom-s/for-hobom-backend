import { AuthEntitySchema } from "../../model/auth.entity";
import { UserNickname } from "../../../../user/domain/model/user-nickname.vo";
import { RefreshToken } from "../../model/refresh-token.vo";

export interface AuthPersistencePort {
  saveRefreshToken(authEntitySchema: AuthEntitySchema): Promise<void>;

  updateRefreshToken(
    nickname: UserNickname,
    newRefreshToken: RefreshToken,
  ): Promise<void>;

  revokeToken(token: RefreshToken): Promise<void>;
}
