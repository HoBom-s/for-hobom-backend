import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class UpdateBoardDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  columns?: {
    statusId: string;
    name: string;
    wipLimit: number | null;
    order: number;
  }[];
}
