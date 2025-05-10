import { AuthEntity, AuthEntitySchema } from "../entity/auth.entity";

export interface AuthRepository {
  findByRefreshToken(token: string): Promise<AuthEntity>;

  save(authEntitySchema: AuthEntitySchema): Promise<void>;

  updateRefreshToken(nickname: string, newRefreshToken: string): Promise<void>;

  revokeToken(token: string): Promise<void>;
}
