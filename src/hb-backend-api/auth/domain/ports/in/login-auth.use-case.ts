import { LoginAuthResult } from "../out/login-auth.result";
import { LoginAuthCommand } from "../out/login-auth.command";

export interface LoginAuthUseCase {
  invoke(command: LoginAuthCommand): Promise<LoginAuthResult>;
}
