import { AuthEntitySchema } from "../../../domain/entity/auth.entity";

export interface AuthQueryPort {
  findByRefreshToken(token: string): Promise<AuthEntitySchema>;
}
