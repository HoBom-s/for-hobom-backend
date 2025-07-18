import { Inject, Injectable } from "@nestjs/common";
import { CreateUserUseCase } from "../../domain/ports/in/create-user.use-case";
import { UserPersistencePort } from "../../domain/ports/out/user-persistence.port";
import { CreateUserCommand } from "../../domain/ports/out/create-user.command";
import { UserCreateEntitySchema } from "../../domain/model/user.entity";
import { DIToken } from "../../../../shared/di/token.di";

@Injectable()
export class CreateUserService implements CreateUserUseCase {
  constructor(
    @Inject(DIToken.UserModule.UserPersistencePort)
    private readonly userPersistencePort: UserPersistencePort,
  ) {}

  public async invoke(command: CreateUserCommand): Promise<void> {
    const newUser = UserCreateEntitySchema.of(
      command.getNickname,
      command.getUsername,
      command.getPassword,
    );
    await this.userPersistencePort.save(newUser);
  }
}
