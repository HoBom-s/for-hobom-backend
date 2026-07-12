import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { IssuePriority } from "../../../domain/enums/issue-priority.enum";

export class UpdateIssueDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  title?: string;

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
  sprint?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  storyPoints?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  labels?: string[];

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  parent?: string | null;
}
