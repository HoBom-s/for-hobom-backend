import { AuthEntitySchema } from "../../model/auth.entity";
import { RefreshToken } from "../../model/refresh-token.vo";
import { UserNickname } from "../../../../user/domain/model/user-nickname.vo";

export interface AuthQueryPort {
  findByRefreshToken(token: RefreshToken): Promise<AuthEntitySchema>;

  findByNickname(nickname: UserNickname): Promise<AuthEntitySchema | null>;
}
