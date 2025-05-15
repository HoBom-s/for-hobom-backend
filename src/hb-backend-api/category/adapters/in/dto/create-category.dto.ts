import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCategoryDto {
  @ApiProperty({ type: "string" })
  @IsString({ message: "카테고리 제목을 입력해 주세요." })
  @IsNotEmpty({ message: "카테고리 제목은 필수로 입력해야 해요." })
  @MinLength(1, { message: "카테고리 제목은 최소 1자 이상이어야 해요." })
  title: string;
}
