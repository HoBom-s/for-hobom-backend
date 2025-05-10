import { Inject, Injectable } from "@nestjs/common";
import { UserPersistencePort } from "../../../application/ports/out/user-persistence.port";
import { UserEntitySchema } from "../../../domain/entity/user.entity";
import { UserRepository } from "../../../domain/repositories/user.repository";

@Injectable()
export class UserPersistenceAdapter implements UserPersistencePort {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
  ) {}

  public async save(user: UserEntitySchema): Promise<void> {
    await this.userRepository.save(user);
  }
}
