import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class AskQuestionDto {
  @ApiProperty({ description: "질문 내용" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  question: string;
}
