import { AuthEntitySchema } from "../../../domain/entity/auth.entity";

export interface AuthPersistencePort {
  saveRefreshToken(authEntitySchema: AuthEntitySchema): Promise<void>;

  updateRefreshToken(nickname: string, newRefreshToken: string): Promise<void>;

  revokeToken(token: string): Promise<void>;
}
