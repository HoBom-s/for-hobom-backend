import { Types } from "mongoose";
import { UserQueryResult } from "../../../application/result/user-query.result";

export class GetUserDto {
  constructor(
    private readonly id: string,
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

  public static from(userQueryResult: UserQueryResult): GetUserDto {
    return new GetUserDto(
      userQueryResult.getId.toString(),
      userQueryResult.getUsername,
      userQueryResult.getEmail,
      userQueryResult.getNickname,
      userQueryResult.getFriends,
    );
  }
}
