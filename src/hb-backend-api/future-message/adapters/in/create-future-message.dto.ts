import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateFutureMessageDto {
  @ApiProperty({ type: "string", required: true })
  @IsString({ message: "Future Message를 보낼 대상의 타입이 올바르지 않아요." })
  @IsNotEmpty({ message: "Future Message를 보낼 대상의 ID를 입력해주세요." })
  recipientId: string;

  @ApiProperty({ type: "string", required: true })
  @IsString({ message: "Future Message 제목의 타입이 올바르지 않아요." })
  @IsNotEmpty({ message: "Future Message 제목을 입력해주세요." })
  title: string;

  @ApiProperty({ type: "string", required: true })
  @IsString({ message: "Future Message 내용의 타입이 올바르지 않아요." })
  @IsNotEmpty({ message: "Future Message 내용을 입력해주세요." })
  content: string;

  @ApiProperty({ type: "string", required: true })
  @IsString({
    message: "Future Message 를 보낼 날짜의 타입이 올바르지 않아요.",
  })
  @IsNotEmpty({ message: "Future Message 를 언제 보낼지 결정해주세요." })
  scheduledAt: string;
}
