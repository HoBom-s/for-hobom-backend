import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { StatusCategory } from "../../../domain/enums/status-category.enum";

class WorkflowStatusDto {
  @ApiProperty({ type: String })
  @IsString()
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @ApiProperty({ enum: StatusCategory })
  @IsEnum(StatusCategory)
  category: StatusCategory;

  @ApiProperty({ type: Number })
  @IsNumber()
  order: number;
}

class WorkflowTransitionDto {
  @ApiProperty({ type: String })
  @IsString()
  from: string;

  @ApiProperty({ type: String })
  @IsString()
  to: string;

  @ApiProperty({ type: String })
  @IsString()
  name: string;
}

export class UpdateProjectWorkflowDto {
  @ApiProperty({ type: [WorkflowStatusDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStatusDto)
  statuses: WorkflowStatusDto[];

  @ApiProperty({ type: [WorkflowTransitionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowTransitionDto)
  transitions: WorkflowTransitionDto[];
}
