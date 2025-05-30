import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { DailyTodoCycle } from "../../../domain/enums/daily-todo-cycle.enum";

export class UpdateDailyTodoCycleDto {
  @ApiProperty({ type: "string", required: true })
  @IsEnum(DailyTodoCycle, {
    message: "데일리 투두의 사이클이 유효하지 않아요.",
  })
  @IsNotEmpty({ message: "데일리 투두의 사이클이 없어요." })
  cycle: DailyTodoCycle;
}
