import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateLabelDto {
  @ApiProperty({ type: "string", required: true })
  @IsString({ message: "라벨 제목을 입력해 주세요." })
  @IsNotEmpty({ message: "라벨 제목은 필수로 입력해야 해요." })
  @MinLength(1, { message: "라벨 제목은 최소 1자 이상이어야 해요." })
  title: string;
}
