import { LoginAuthResult } from "../../result/login-auth.result";
import { RefreshToken } from "../../../domain/vo/refresh-token.vo";

export interface RefreshAuthTokenUseCase {
  invoke(refreshToken: RefreshToken): Promise<LoginAuthResult>;
}
