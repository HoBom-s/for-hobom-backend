import { Recurrence } from "../enums/recurrence.enum";

export class NoteReminder {
  constructor(
    private readonly date: Date,
    private readonly recurrence: Recurrence,
  ) {
    Object.freeze(this);
  }

  public static of(date: Date, recurrence: Recurrence): NoteReminder {
    return new NoteReminder(date, recurrence);
  }

  public get getDate(): Date {
    return this.date;
  }

  public get getRecurrence(): Recurrence {
    return this.recurrence;
  }

  public toPlain(): { date: Date; recurrence: Recurrence } {
    return { date: this.date, recurrence: this.recurrence };
  }
}
