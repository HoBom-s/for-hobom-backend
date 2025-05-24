import { PipeTransform } from "@nestjs/common";
import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";

export class ParseDailyTodoIdPipe
  implements PipeTransform<string, DailyTodoId>
{
  transform(value: string): DailyTodoId {
    return DailyTodoId.fromString(value);
  }
}
