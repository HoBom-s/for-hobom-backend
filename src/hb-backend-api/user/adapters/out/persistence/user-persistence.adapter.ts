import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserPersistencePort } from "../../../application/ports/out/user-persistence.port";
import {
  UserEntity,
  UserEntitySchema,
} from "../../../domain/entity/user.entity";
import { UserDocument } from "../../../domain/entity/user.schema";

@Injectable()
export class UserPersistenceAdapter implements UserPersistencePort {
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
}
