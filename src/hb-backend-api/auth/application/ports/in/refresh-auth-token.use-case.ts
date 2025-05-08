import { LoginAuthResult } from "../../result/login-auth.result";

export interface RefreshAuthTokenUseCase {
  invoke(refreshToken: string): Promise<LoginAuthResult>;
}
