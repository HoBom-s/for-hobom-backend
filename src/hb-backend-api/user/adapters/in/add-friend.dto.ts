import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AddFriendDto {
  @ApiProperty({ type: "string" })
  @IsNotEmpty({ message: "사용자 ID를 입력해 주세요." })
  @IsString({ message: "사용자 ID는 문자열만 가능해요." })
  id: string;
}
