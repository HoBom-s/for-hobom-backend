import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class PriorityDto {
  @ApiProperty({ type: String })
  @IsString()
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @ApiProperty({ type: String })
  @IsString()
  icon: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  order: number;
}

export class UpdateProjectPrioritiesDto {
  @ApiProperty({ type: [PriorityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriorityDto)
  priorities: PriorityDto[];
}
