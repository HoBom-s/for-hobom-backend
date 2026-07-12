import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class CreateProjectDto {
  @ApiProperty({ type: String, example: "HB" })
  @IsString()
  @Matches(/^[A-Z]{2,5}$/, {
    message: "프로젝트 키는 2~5자의 영문 대문자여야 해요.",
  })
  key: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  description?: string;
}
