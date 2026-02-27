import { RefreshToken } from "../../model/refresh-token.vo";

export interface LogoutAuthUseCase {
  invoke(refreshToken: RefreshToken): Promise<void>;
}
