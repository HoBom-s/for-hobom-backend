import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class AddNoteMemberDto {
  @ApiProperty({ description: "추가할 멤버의 사용자 ID" })
  @IsString()
  userId: string;
}
