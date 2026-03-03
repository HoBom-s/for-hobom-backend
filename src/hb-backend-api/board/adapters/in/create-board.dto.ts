import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { BoardType } from "../../domain/enums/board-type.enum";

export class CreateBoardDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ enum: BoardType })
  @IsNotEmpty()
  @IsEnum(BoardType)
  type: BoardType;
}
