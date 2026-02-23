import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsEnum,
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
  date: Date;

  @ApiProperty({ enum: Recurrence })
  @IsEnum(Recurrence)
  recurrence: Recurrence;
}

export class CreateNoteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
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
