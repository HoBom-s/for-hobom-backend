import { Types } from "mongoose";
import { UserEntitySchema } from "../../domain/entity/user.entity";
import { UserId } from "../../domain/vo/user-id.vo";

export class UserQueryResult {
  constructor(
    private readonly id: UserId,
    private readonly username: string,
    private readonly email: string,
    private readonly nickname: string,
    private readonly friends: Types.ObjectId[],
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.nickname = nickname;
    this.friends = friends;
  }

  public static from(entity: UserEntitySchema): UserQueryResult {
    return new UserQueryResult(
      entity.getId,
      entity.getUsername,
      entity.getEmail,
      entity.getNickname,
      entity.getFriends,
    );
  }

  get getId(): UserId {
    return this.id;
  }

  get getUsername(): string {
    return this.username;
  }

  get getEmail(): string {
    return this.email;
  }

  get getNickname(): string {
    return this.nickname;
  }

  get getFriends(): Types.ObjectId[] {
    return this.friends;
  }
}
