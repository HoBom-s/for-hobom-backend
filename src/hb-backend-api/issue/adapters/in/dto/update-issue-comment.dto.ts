import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateIssueCommentDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  body: string;
}
