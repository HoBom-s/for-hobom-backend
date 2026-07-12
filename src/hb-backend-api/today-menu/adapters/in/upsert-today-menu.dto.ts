import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class UpsertTodayMenuDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  candidates: string[];

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  recommendedMenu?: string | null;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  recommendationDate?: string | null;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  todayMenuId?: string | null;
}
