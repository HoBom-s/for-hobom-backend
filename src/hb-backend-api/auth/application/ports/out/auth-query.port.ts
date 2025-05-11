import { AuthEntitySchema } from "../../../domain/entity/auth.entity";
import { RefreshToken } from "../../../domain/vo/refresh-token.vo";

export interface AuthQueryPort {
  findByRefreshToken(token: RefreshToken): Promise<AuthEntitySchema>;
}
