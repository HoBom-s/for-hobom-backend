import { DailyTodoCompleteStatus } from "../../../domain/enums/daily-todo-complete-status.enum";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";

export class UpdateDailyTodoCompleteStatusDto {
  @ApiProperty({ type: "string", required: true })
  @IsEnum(DailyTodoCompleteStatus, {
    message: "데일리 투두의 진행상태가 유효하지 않아요.",
  })
  @IsNotEmpty({ message: "데일리 투두의 진행상태가 없어요." })
  status: DailyTodoCompleteStatus;
}
