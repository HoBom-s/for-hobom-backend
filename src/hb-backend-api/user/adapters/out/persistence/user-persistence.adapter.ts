import { Inject, Injectable } from "@nestjs/common";
import { UserPersistencePort } from "../../../application/ports/out/user-persistence.port";
import { UserCreateEntitySchema } from "../../../domain/entity/user.entity";
import { UserRepository } from "../../../domain/repositories/user.repository";
import { DIToken } from "../../../../../shared/di/token.di";

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
