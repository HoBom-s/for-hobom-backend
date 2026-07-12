import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class AssignIssueDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  assignee?: string;
}
