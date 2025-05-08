import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserQueryPort } from "../../../application/ports/out/user-query.port";
import {
  UserEntity,
  UserEntitySchema,
} from "../../../domain/entity/user.entity";
import { UserDocument } from "../../../domain/entity/user.schema";

@Injectable()
export class UserQueryAdapter implements UserQueryPort {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  public async findById(id: string): Promise<UserEntitySchema> {
    const foundUser = await this.userModel.findById(id).lean().exec();

    if (foundUser == null) {
      throw new NotFoundException(`해당 유저를 찾을 수 없어요. ${id}`);
    }

    const { username, nickname, password, friends } = foundUser;

    return UserEntitySchema.of(username, nickname, password, friends);
  }
}
