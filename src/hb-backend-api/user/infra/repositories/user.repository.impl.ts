import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserRepository } from "../../domain/model/user.repository";
import { UserDocument } from "../../domain/model/user.schema";
import {
  UserCreateEntitySchema,
  UserEntity,
} from "../../domain/model/user.entity";
import { UserId } from "../../domain/model/user-id.vo";
import { UserNickname } from "../../domain/model/user-nickname.vo";

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  public async save(user: UserCreateEntitySchema): Promise<void> {
    await this.userModel.create({
      username: user.getUsername,
      nickname: user.getNickname,
      password: user.getPassword,
      friends: [],
    });
  }

  public async findById(id: UserId): Promise<UserDocument> {
    const foundUser = await this.userModel.findById(id.raw).exec();
    if (foundUser == null) {
      throw new NotFoundException(
        `해당 유저를 찾을 수 없어요. ${id.raw.toHexString()}`,
      );
    }

    return foundUser;
  }

  public async findByNickname(nickname: UserNickname): Promise<UserDocument> {
    const foundUser = await this.userModel
      .findOne({
        nickname: nickname.raw,
      })
      .exec();
    if (foundUser == null) {
      throw new NotFoundException(
        `해당 유저를 찾을 수 없어요. ${nickname.raw}`,
      );
    }

    return foundUser;
  }
}
