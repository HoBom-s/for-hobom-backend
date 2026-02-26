import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { NotificationCategory } from "../../domain/enums/notification-category.enum";

export class CreateNotificationDto {
  @ApiPropertyOptional({
    enum: NotificationCategory,
    default: NotificationCategory.SYSTEM,
  })
  @IsOptional()
  @IsEnum(NotificationCategory, {
    message: "올바른 알림 카테고리를 입력해 주세요.",
  })
  category?: NotificationCategory;

  @ApiProperty({ type: "string" })
  @IsString({ message: "수신자 닉네임은 문자열만 가능해요." })
  @IsNotEmpty({ message: "수신자 닉네임을 입력해 주세요." })
  recipient: string;

  @ApiProperty({ type: "string" })
  @IsString({ message: "알림 제목은 문자열만 가능해요." })
  @IsNotEmpty({ message: "알림 제목을 입력해 주세요." })
  @MaxLength(200, { message: "알림 제목은 최대 200자까지 가능해요." })
  title: string;

  @ApiProperty({ type: "string" })
  @IsString({ message: "알림 본문은 문자열만 가능해요." })
  @IsNotEmpty({ message: "알림 본문을 입력해 주세요." })
  @MaxLength(2000, { message: "알림 본문은 최대 2000자까지 가능해요." })
  body: string;

  @ApiProperty({ type: "string" })
  @IsString({ message: "발신자 ID는 문자열만 가능해요." })
  @IsNotEmpty({ message: "발신자 ID를 입력해 주세요." })
  senderId: string;
}
