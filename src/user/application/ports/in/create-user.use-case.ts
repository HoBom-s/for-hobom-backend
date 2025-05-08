import { CreateUserCommand } from "../../command/create-user.command";

export interface CreateUserUseCase {
  invoke(command: CreateUserCommand): Promise<void>;
}
