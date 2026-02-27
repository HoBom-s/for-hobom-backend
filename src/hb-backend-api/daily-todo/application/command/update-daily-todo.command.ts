import { CategoryId } from "../../../category/domain/model/category-id.vo";

export class UpdateDailyTodoCommand {
  constructor(
    private readonly title?: string,
    private readonly date?: Date,
    private readonly category?: CategoryId,
  ) {}

  public static of(
    title?: string,
    date?: Date,
    category?: CategoryId,
  ): UpdateDailyTodoCommand {
    return new UpdateDailyTodoCommand(title, date, category);
  }

  public get getTitle(): string | undefined {
    return this.title;
  }

  public get getDate(): Date | undefined {
    return this.date;
  }

  public get getCategory(): CategoryId | undefined {
    return this.category;
  }
}
