import { AuthEntitySchema } from "../../../domain/entity/auth.entity";
import { UserNickname } from "../../../../user/domain/vo/user-nickname.vo";
import { RefreshToken } from "../../../domain/vo/refresh-token.vo";

export interface AuthPersistencePort {
  saveRefreshToken(authEntitySchema: AuthEntitySchema): Promise<void>;

  updateRefreshToken(
    nickname: UserNickname,
    newRefreshToken: RefreshToken,
  ): Promise<void>;

  revokeToken(token: RefreshToken): Promise<void>;
}
