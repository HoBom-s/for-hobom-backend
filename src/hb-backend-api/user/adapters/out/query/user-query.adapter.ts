import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserQueryPort } from "../../../application/ports/out/user-query.port";
import { UserEntitySchema } from "../../../domain/entity/user.entity";
import { UserRepository } from "../../../domain/repositories/user.repository";

@Injectable()
export class UserQueryAdapter implements UserQueryPort {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
  ) {}

  public async findById(id: string): Promise<UserEntitySchema> {
    const foundUser = await this.userRepository.findById(id);
    if (foundUser == null) {
      throw new NotFoundException(`해당 유저를 찾을 수 없어요. ${id}`);
    }

    const { username, nickname, password, friends } = foundUser;

    return UserEntitySchema.of(username, nickname, password, friends);
  }

  public async findByNickname(nickname: string): Promise<UserEntitySchema> {
    const foundUser = await this.userRepository.findByNickname(nickname);
    if (foundUser == null) {
      throw new NotFoundException(`해당 유저를 찾을 수 없어요. ${nickname}`);
    }

    return UserEntitySchema.of(
      foundUser.username,
      foundUser.nickname,
      foundUser.password,
      foundUser.friends,
    );
  }
}
