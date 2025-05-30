import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateDailyTodoReactionDto {
  @ApiProperty({ type: "string", required: true })
  @IsString({ message: "리액션은 문자열만 가능해요." })
  @IsNotEmpty({ message: "리액션이 존재하지 않아요." })
  reaction: string;

  @ApiProperty({ type: "string", required: true })
  @IsString({ message: "리액션을 누른 사람의 ID는 문자열 이어야 해요." })
  @IsNotEmpty({ message: "리액션을 누른 사람이 존재하지 않아요." })
  reactionUserId: string;
}
