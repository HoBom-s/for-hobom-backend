import { CategoryId } from "../../../category/domain/model/category-id.vo";
import { DailyTodoCycle } from "../../domain/enums/daily-todo-cycle.enum";

export class CreateDailyTodoCommand {
  constructor(
    private readonly title: string,
    private readonly date: Date,
    private readonly category: CategoryId,
    private readonly cycle?: DailyTodoCycle,
  ) {}

  public static of(
    title: string,
    date: Date,
    category: CategoryId,
    cycle?: DailyTodoCycle,
  ): CreateDailyTodoCommand {
    return new CreateDailyTodoCommand(title, date, category, cycle);
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

  public get getCycle(): DailyTodoCycle | undefined {
    return this.cycle;
  }
}
