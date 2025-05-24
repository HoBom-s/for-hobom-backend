import { AuthEntitySchema } from "../../../domain/entity/auth.entity";
import { RefreshToken } from "../../../domain/vo/refresh-token.vo";
import { UserNickname } from "../../../../user/domain/vo/user-nickname.vo";

export interface AuthQueryPort {
  findByRefreshToken(token: RefreshToken): Promise<AuthEntitySchema>;

  findByNickname(nickname: UserNickname): Promise<AuthEntitySchema | null>;
}
