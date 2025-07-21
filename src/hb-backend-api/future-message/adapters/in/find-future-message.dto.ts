import { SendStatus } from "../../domain/model/send-status.enum";
import { ApiProperty } from "@nestjs/swagger";
import { FutureMessageQueryResult } from "../../domain/ports/out/future-message-query.result";

export class FindFutureMessageDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  content: string;

  @ApiProperty({ enum: SendStatus })
  sendStatus: SendStatus;

  @ApiProperty({ type: String })
  scheduledAt: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  constructor(
    id: string,
    title: string,
    content: string,
    sendStatus: SendStatus,
    scheduledAt: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.sendStatus = sendStatus;
    this.scheduledAt = scheduledAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static from(entity: FutureMessageQueryResult): FindFutureMessageDto {
    return new FindFutureMessageDto(
      entity.getId.toString(),
      entity.getTitle,
      entity.getContent,
      entity.getSendStatus,
      entity.getScheduledAt,
      entity.getCreatedAt,
      entity.getUpdatedAt,
    );
  }
}
