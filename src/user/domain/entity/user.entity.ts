import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../shared/base/base.entity";

@Schema({ collection: "user" })
export class UserEntity extends BaseEntity {
  @Prop({ type: String, required: true })
  username: string;

  @Prop({ type: String, required: true, unique: true })
  nickname: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: [Types.ObjectId], ref: "user", default: [] })
  friends: Types.ObjectId[];
}

export class UserEntitySchema {
  constructor(
    private readonly username: string,
    private readonly nickname: string,
    private readonly password: string,
    private readonly friends: Types.ObjectId[],
  ) {
    this.username = username;
    this.nickname = nickname;
    this.password = password;
    this.friends = friends;
  }

  public static of(
    username: string,
    nickname: string,
    password: string,
    friends?: Types.ObjectId[],
  ): UserEntitySchema {
    return new UserEntitySchema(username, nickname, password, friends ?? []);
  }

  get getUsername(): string {
    return this.username;
  }

  get getNickname(): string {
    return this.nickname;
  }

  get getPassword(): string {
    return this.password;
  }

  get getFriends(): Types.ObjectId[] {
    return this.friends;
  }
}
