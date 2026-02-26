import { ApiProperty } from "@nestjs/swagger";
import { NotificationCategory } from "../../domain/enums/notification-category.enum";
import { NotificationQueryResult } from "../../domain/ports/out/notification-query.result";

export class NotificationResponseDto {
  @ApiProperty({ type: "string" })
  id: string;

  @ApiProperty({ enum: NotificationCategory })
  category: NotificationCategory;

  @ApiProperty({ type: "string" })
  title: string;

  @ApiProperty({ type: "string" })
  body: string;

  @ApiProperty({ type: "string" })
  senderId: string;

  @ApiProperty({ type: "boolean" })
  isRead: boolean;

  @ApiProperty({ type: "string", format: "date-time" })
  createdAt: Date;

  constructor(
    id: string,
    category: NotificationCategory,
    title: string,
    body: string,
    senderId: string,
    isRead: boolean,
    createdAt: Date,
  ) {
    this.id = id;
    this.category = category;
    this.title = title;
    this.body = body;
    this.senderId = senderId;
    this.isRead = isRead;
    this.createdAt = createdAt;
  }

  public static from(result: NotificationQueryResult): NotificationResponseDto {
    return new NotificationResponseDto(
      result.getId.toString(),
      result.getCategory,
      result.getTitle,
      result.getBody,
      result.getSenderId,
      result.getIsRead,
      result.getCreatedAt,
    );
  }
}
