import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class WorkflowStatusDto {
  @ApiProperty({ type: String })
  @IsString()
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  isDone: boolean;

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
