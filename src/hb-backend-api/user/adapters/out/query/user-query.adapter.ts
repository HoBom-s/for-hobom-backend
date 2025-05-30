import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserQueryPort } from "../../../application/ports/out/user-query.port";
import { UserEntitySchema } from "../../../domain/entity/user.entity";
import { UserRepository } from "../../../domain/repositories/user.repository";
import { DIToken } from "../../../../../shared/di/token.di";
import { UserId } from "../../../domain/vo/user-id.vo";
import { UserNickname } from "../../../domain/vo/user-nickname.vo";

@Injectable()
export class UserQueryAdapter implements UserQueryPort {
  constructor(
    @Inject(DIToken.UserModule.UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  public async findById(id: UserId): Promise<UserEntitySchema> {
    const foundUser = await this.userRepository.findById(id);
    if (foundUser == null) {
      throw new NotFoundException(
        `해당 유저를 찾을 수 없어요. ${id.raw.toHexString()}`,
      );
    }

    return UserEntitySchema.of(
      UserId.fromString(String(foundUser._id)),
      foundUser.username,
      foundUser.email,
      foundUser.nickname,
      foundUser.password,
      foundUser.friends,
    );
  }

  public async findByNickname(
    nickname: UserNickname,
  ): Promise<UserEntitySchema> {
    const foundUser = await this.userRepository.findByNickname(nickname);
    if (foundUser == null) {
      throw new NotFoundException(
        `해당 유저를 찾을 수 없어요. ${nickname.raw}`,
      );
    }

    return UserEntitySchema.of(
      UserId.fromString(String(foundUser._id)),
      foundUser.username,
      foundUser.email,
      foundUser.nickname,
      foundUser.password,
      foundUser.friends,
    );
  }
}
