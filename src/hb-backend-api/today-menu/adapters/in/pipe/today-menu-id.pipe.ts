import { PipeTransform } from "@nestjs/common";
import { TodayMenuId } from "../../../domain/vo/today-menu.vo";

export class ParseTodayMenuIdPipe
  implements PipeTransform<string, TodayMenuId>
{
  transform(value: string): TodayMenuId {
    return TodayMenuId.fromSting(value);
  }
}
