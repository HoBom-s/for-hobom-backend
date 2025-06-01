import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateDailyTodoDto {
  @ApiProperty({ type: "string", required: true })
  @IsString({ message: "데일리 투두 제목을 입력해 주세요." })
  @IsNotEmpty({ message: "데일리 투두 제목은 필수로 입력해야 해요." })
  @MinLength(1, { message: "데일리 투두 제목은 최소 1자 이상이어야 해요." })
  title: string;

  @ApiProperty({ type: "string", required: true })
  @IsString({ message: "데일리 투두의 날짜를 선택해 주세요." })
  @IsNotEmpty({ message: "데일리 투두의 날짜는 필수로 입력해야 해요." })
  date: string;

  @ApiProperty({ type: "string" })
  @IsOptional()
  @IsString({ message: "카테고리는 문자열이어야 해요." })
  @IsNotEmpty({ message: "데일리 투두의 카테고리는 필수에요." })
  category: string;
}
