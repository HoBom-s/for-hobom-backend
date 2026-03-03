import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class IssueTypeDto {
  @ApiProperty({ type: String })
  @IsString()
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @ApiProperty({ type: String })
  @IsString()
  icon: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  isSubtask: boolean;
}

export class UpdateProjectIssueTypesDto {
  @ApiProperty({ type: [IssueTypeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IssueTypeDto)
  issueTypes: IssueTypeDto[];
}
