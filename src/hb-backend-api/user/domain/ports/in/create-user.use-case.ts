import { CreateUserCommand } from "../out/create-user.command";

export interface CreateUserUseCase {
  invoke(command: CreateUserCommand): Promise<void>;
}
