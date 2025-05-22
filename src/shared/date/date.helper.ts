export class DateHelper {
  public static formatDate(date: Date = new Date()): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  public static formatDateTime(date: Date = new Date()): string {
    return `${this.formatDate(date)} ${date.toTimeString().split(" ")[0]}`;
  }

  public static format(date: Date, formatStr: string): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return formatStr
      .replace("yyyy", date.getFullYear().toString())
      .replace("MM", pad(date.getMonth() + 1))
      .replace("dd", pad(date.getDate()))
      .replace("HH", pad(date.getHours()))
      .replace("mm", pad(date.getMinutes()))
      .replace("ss", pad(date.getSeconds()));
  }

  public static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  public static diffInDays(date1: Date, date2: Date): number {
    const diff = Math.abs(date1.getTime() - date2.getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  public static startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  public static endOfDay(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999,
    );
  }

  public static isValid(date: unknown): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  public static parse(dateStr: string): Date {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) {
      throw new Error("Invalid date string");
    }

    const [year, month, day] = dateStr.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      throw new Error("Invalid date");
    }

    if (!this.isValid(parsed)) {
      throw new Error("Invalid date instance");
    }

    return parsed;
  }

  public static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}
