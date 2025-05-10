import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserRepository } from "../../domain/repositories/user.repository";
import { UserDocument } from "../../domain/entity/user.schema";
import { UserEntity, UserEntitySchema } from "../../domain/entity/user.entity";

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  public async save(user: UserEntitySchema): Promise<void> {
    await this.userModel.create({
      username: user.getUsername,
      nickname: user.getNickname,
      password: user.getPassword,
      friends: [],
    });
  }

  public async findById(id: string): Promise<UserEntity> {
    const foundUser = await this.userModel.findById(id).lean().exec();
    if (foundUser == null) {
      throw new NotFoundException(`해당 유저를 찾을 수 없어요. ${id}`);
    }

    return foundUser;
  }

  public async findByNickname(nickname: string): Promise<UserEntity> {
    const foundUser = await this.userModel
      .findOne({
        nickname,
      })
      .lean()
      .exec();
    if (foundUser == null) {
      throw new NotFoundException(`해당 유저를 찾을 수 없어요. ${nickname}`);
    }

    return foundUser;
  }
}
