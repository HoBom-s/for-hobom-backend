import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class ReorderNoteDto {
  @ApiProperty() @IsNumber() order: number;
}
