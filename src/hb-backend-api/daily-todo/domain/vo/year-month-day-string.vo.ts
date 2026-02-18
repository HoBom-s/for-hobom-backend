import { BadRequestException } from "@nestjs/common";
import { DateHelper } from "../../../../shared/date/date.helper";

export class YearMonthDayString {
  private readonly _value: string;
  private readonly _year: number;
  private readonly _month: number;
  private readonly _day: number;

  constructor(dateStr: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new BadRequestException(
        `날짜 형식이 올바르지 않아요. (YYYY-MM-DD): ${dateStr}`,
      );
    }

    const [yearStr, monthStr, dayStr] = dateStr.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    const date = new Date(dateStr);
    if (
      !DateHelper.isValid(date) ||
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day
    ) {
      throw new BadRequestException(`존재하지 않는 날짜에요. ${dateStr}`);
    }

    this._value = dateStr;
    this._year = year;
    this._month = month;
    this._day = day;
    Object.freeze(this);
  }

  public equals(other: YearMonthDayString): boolean {
    return this._value === other._value;
  }

  public static fromString(dateStr: string): YearMonthDayString {
    return new YearMonthDayString(dateStr);
  }

  public get value(): string {
    return this._value;
  }

  public get year(): number {
    return this._year;
  }

  public get month(): number {
    return this._month;
  }

  public get day(): number {
    return this._day;
  }
}
