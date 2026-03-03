import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class UpdateSprintDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
