import { Types } from "mongoose";
import { UserQueryResult } from "../../../application/result/user-query.result";
import { ApiProperty } from "@nestjs/swagger";

export class GetUserDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  username: string;

  @ApiProperty({ type: String })
  email: string;

  @ApiProperty({ type: String })
  nickname: string;

  @ApiProperty({ type: [String] })
  friends: Types.ObjectId[];

  constructor(
    id: string,
    username: string,
    email: string,
    nickname: string,
    friends: Types.ObjectId[],
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
