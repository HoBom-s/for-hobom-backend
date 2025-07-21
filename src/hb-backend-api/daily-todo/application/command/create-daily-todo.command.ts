import { CategoryId } from "../../../category/domain/model/category-id.vo";

export class CreateDailyTodoCommand {
  constructor(
    private readonly title: string,
    private readonly date: Date,
    private readonly category: CategoryId,
  ) {
    this.title = title;
    this.date = date;
    this.category = category;
  }

  public static of(
    title: string,
    date: Date,
    category: CategoryId,
  ): CreateDailyTodoCommand {
    return new CreateDailyTodoCommand(title, date, category);
  }

  public get getTitle(): string {
    return this.title;
  }

  public get getDate(): Date {
    return this.date;
  }

  public get getCategory(): CategoryId {
    return this.category;
  }
}
