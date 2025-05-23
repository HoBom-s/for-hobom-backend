import { PipeTransform } from "@nestjs/common";
import { YearMonthDayString } from "../../../domain/vo/year-month-day-string.vo";

export class ParseYearMonthDayStringPipe
  implements PipeTransform<string, YearMonthDayString>
{
  transform(value: string): YearMonthDayString {
    return YearMonthDayString.fromString(value);
  }
}
