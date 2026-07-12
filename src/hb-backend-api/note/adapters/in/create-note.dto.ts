import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  Matches,
  MaxLength,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { NoteType } from "../../domain/enums/note-type.enum";
import { Recurrence } from "../../domain/enums/recurrence.enum";

export class ChecklistItemDto {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  text: string;

  @ApiProperty()
  @IsBoolean()
  checked: boolean;

  @ApiProperty()
  @IsNumber()
  order: number;
}

export class ReminderDto {
  @ApiProperty()
  @IsString()
  date: string;

  @ApiProperty({ enum: Recurrence })
  @IsEnum(Recurrence)
  recurrence: Recurrence;
}

export class CreateNoteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  content?: string;

  @ApiProperty({ enum: NoteType, default: NoteType.TEXT })
  @IsEnum(NoteType)
  type: NoteType;

  @ApiPropertyOptional({ type: [ChecklistItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklistItems?: ChecklistItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: "색상은 #RRGGBB 형식이어야 해요." })
  color?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @ApiPropertyOptional({ type: ReminderDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReminderDto)
  reminder?: ReminderDto;
}
