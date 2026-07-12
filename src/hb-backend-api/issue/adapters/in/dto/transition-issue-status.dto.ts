import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class TransitionIssueStatusDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  statusId: string;
}
