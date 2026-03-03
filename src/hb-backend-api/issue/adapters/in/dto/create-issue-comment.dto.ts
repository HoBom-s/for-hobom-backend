import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateIssueCommentDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  body: string;
}
