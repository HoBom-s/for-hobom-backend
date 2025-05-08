import { Types } from "mongoose";
import { UserEntitySchema } from "../../domain/entity/user.entity";

export class UserQueryResult {
  constructor(
    private readonly username: string,
    private readonly nickname: string,
    private readonly friends: Types.ObjectId[],
  ) {
    this.username = username;
    this.nickname = nickname;
    this.friends = friends;
  }

  public static from(entity: UserEntitySchema): UserQueryResult {
    return new UserQueryResult(
      entity.getUsername,
      entity.getNickname,
      entity.getFriends,
    );
  }

  get getUsername(): string {
    return this.username;
  }

  get getNickname(): string {
    return this.nickname;
  }

  get getFriends(): Types.ObjectId[] {
    return this.friends;
  }
}
