import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AskQuestionDto {
  @ApiProperty({ description: "질문 내용" })
  @IsString()
  @IsNotEmpty()
  question: string;
}
