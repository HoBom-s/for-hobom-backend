import { LoginAuthResult } from "../../result/login-auth.result";
import { LoginAuthCommand } from "../../command/login-auth.command";

export interface LoginAuthUseCase {
  invoke(command: LoginAuthCommand): Promise<LoginAuthResult>;
}
