import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateDailyTodoReactionDto {
  @ApiProperty({ type: "string", required: true })
  @IsString({ message: "리액션은 문자열만 가능해요." })
  @IsNotEmpty({ message: "리액션이 존재하지 않아요." })
  reaction: string;
}
