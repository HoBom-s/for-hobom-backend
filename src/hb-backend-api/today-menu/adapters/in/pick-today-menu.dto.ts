import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class PickTodayMenuDto {
  @ApiProperty({ type: String })
  @IsString({ message: "메뉴의 ID는 문자열 이어야 해요." })
  @IsNotEmpty({ message: "메뉴의 ID는 필수에요." })
  todayMenuId: string;
}
