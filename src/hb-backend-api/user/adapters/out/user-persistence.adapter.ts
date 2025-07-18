import { Inject, Injectable } from "@nestjs/common";
import { UserPersistencePort } from "../../domain/ports/out/user-persistence.port";
import { UserCreateEntitySchema } from "../../domain/model/user.entity";
import { UserRepository } from "../../domain/model/user.repository";
import { DIToken } from "../../../../shared/di/token.di";

@Injectable()
export class UserPersistenceAdapter implements UserPersistencePort {
  constructor(
    @Inject(DIToken.UserModule.UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  public async save(user: UserCreateEntitySchema): Promise<void> {
    await this.userRepository.save(user);
  }
}
