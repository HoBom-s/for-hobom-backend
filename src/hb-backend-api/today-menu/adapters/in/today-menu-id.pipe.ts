import { PipeTransform } from "@nestjs/common";
import { TodayMenuId } from "../../domain/model/today-menu.vo";

export class ParseTodayMenuIdPipe
  implements PipeTransform<string, TodayMenuId>
{
  transform(value: string): TodayMenuId {
    return TodayMenuId.fromString(value);
  }
}
