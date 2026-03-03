import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IssueType } from "../../../domain/enums/issue-type.enum";
import { IssuePriority } from "../../../domain/enums/issue-priority.enum";

export class CreateIssueDto {
  @ApiProperty({ enum: IssueType })
  @IsEnum(IssueType)
  type: IssueType;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: IssuePriority })
  @IsOptional()
  @IsEnum(IssuePriority)
  priority?: IssuePriority;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  assignee?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  sprint?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  parent?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  labels?: string[];
}
