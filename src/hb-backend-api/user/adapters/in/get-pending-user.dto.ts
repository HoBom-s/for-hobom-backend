import { ApiProperty } from "@nestjs/swagger";
import { UserEntitySchema } from "../../domain/model/user.entity";

export class GetPendingUserDto {
  @ApiProperty({ type: String, description: "사용자 ID" })
  id: string;

  @ApiProperty({ type: String, description: "사용자 이름" })
  username: string;

  @ApiProperty({ type: String, description: "닉네임" })
  nickname: string;

  @ApiProperty({ type: String, description: "이메일" })
  email: string;

  constructor(id: string, username: string, nickname: string, email: string) {
    this.id = id;
    this.username = username;
    this.nickname = nickname;
    this.email = email;
  }

  public static from(user: UserEntitySchema): GetPendingUserDto {
    return new GetPendingUserDto(
      user.getId.raw.toHexString(),
      user.getUsername,
      user.getNickname,
      user.getEmail,
    );
  }
}
