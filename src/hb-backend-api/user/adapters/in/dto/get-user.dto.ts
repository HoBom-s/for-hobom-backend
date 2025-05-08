import { Types } from "mongoose";
import { UserQueryResult } from "../../../application/result/user-query.result";

export class GetUserDto {
  constructor(
    private readonly username: string,
    private readonly nickname: string,
    private readonly friends: Types.ObjectId[],
  ) {
    this.username = username;
    this.nickname = nickname;
    this.friends = friends;
  }

  public static from(userQueryResult: UserQueryResult): GetUserDto {
    return new GetUserDto(
      userQueryResult.getUsername,
      userQueryResult.getNickname,
      userQueryResult.getFriends,
    );
  }
}
