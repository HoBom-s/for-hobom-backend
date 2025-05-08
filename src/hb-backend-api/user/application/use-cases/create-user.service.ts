import { Inject, Injectable } from "@nestjs/common";
import { CreateUserUseCase } from "../ports/in/create-user.use-case";
import { UserPersistencePort } from "../ports/out/user-persistence.port";
import { CreateUserCommand } from "../command/create-user.command";
import { UserEntitySchema } from "../../domain/entity/user.entity";

@Injectable()
export class CreateUserService implements CreateUserUseCase {
  constructor(
    @Inject("UserPersistencePort")
    private readonly userPersistencePort: UserPersistencePort,
  ) {}

  public async invoke(command: CreateUserCommand): Promise<void> {
    const newUser = UserEntitySchema.of(
      command.getNickname,
      command.getUsername,
      command.getPassword,
    );
    await this.userPersistencePort.save(newUser);
  }
}
