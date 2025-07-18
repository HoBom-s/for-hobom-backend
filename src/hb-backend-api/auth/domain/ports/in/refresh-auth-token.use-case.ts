import { LoginAuthResult } from "../out/login-auth.result";
import { RefreshToken } from "../../model/refresh-token.vo";

export interface RefreshAuthTokenUseCase {
  invoke(refreshToken: RefreshToken): Promise<LoginAuthResult>;
}
