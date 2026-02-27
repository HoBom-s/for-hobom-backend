import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateFutureMessageDto {
  @ApiProperty({ type: "string", required: false })
  @IsOptional()
  @IsString({ message: "제목의 타입이 올바르지 않아요." })
  @IsNotEmpty({ message: "제목은 비어있을 수 없어요." })
  title?: string;

  @ApiProperty({ type: "string", required: false })
  @IsOptional()
  @IsString({ message: "내용의 타입이 올바르지 않아요." })
  @IsNotEmpty({ message: "내용은 비어있을 수 없어요." })
  content?: string;

  @ApiProperty({ type: "string", required: false })
  @IsOptional()
  @IsString({ message: "보낼 날짜의 타입이 올바르지 않아요." })
  @IsNotEmpty({ message: "보낼 날짜는 비어있을 수 없어요." })
  scheduledAt?: string;
}
