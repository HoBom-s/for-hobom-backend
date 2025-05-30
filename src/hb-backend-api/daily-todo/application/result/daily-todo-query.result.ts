import { DailyTodoId } from "../../domain/vo/daily-todo-id.vo";
import { DailyTodoCompleteStatus } from "../../domain/enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "../../domain/enums/daily-todo-cycle.enum";
import {
  Category,
  DailyTodoWithRelationEntity,
  Owner,
  Reaction,
} from "../../domain/entity/daily-todo.retations";

export class DailyTodoWithRelationQueryResult {
  constructor(
    private readonly id: DailyTodoId,
    private readonly title: string,
    private readonly date: Date,
    private readonly reaction: Reaction | null,
    private readonly progress: DailyTodoCompleteStatus,
    private readonly cycle: DailyTodoCycle,
    private readonly owner: Owner,
    private readonly category: Category | null,
  ) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.reaction = reaction;
    this.progress = progress;
    this.cycle = cycle;
    this.owner = owner;
    this.category = category;
  }

  public static from(
    dailyTodo: DailyTodoWithRelationEntity,
  ): DailyTodoWithRelationQueryResult {
    return new DailyTodoWithRelationQueryResult(
      dailyTodo.getId,
      dailyTodo.getTitle,
      dailyTodo.getDate,
      dailyTodo.getReaction,
      dailyTodo.getProgress,
      dailyTodo.getCycle,
      dailyTodo.getOwner,
      dailyTodo.getCategory,
    );
  }

  public get getId(): DailyTodoId {
    return this.id;
  }

  public get getTitle(): string {
    return this.title;
  }

  public get getDate(): Date {
    return this.date;
  }

  public get getReaction(): Reaction | null {
    return this.reaction;
  }

  public get getProgress(): DailyTodoCompleteStatus {
    return this.progress;
  }

  public get getCycle(): DailyTodoCycle {
    return this.cycle;
  }

  public get getOwner(): Owner {
    return this.owner;
  }

  public get getCategory(): Category | null {
    return this.category;
  }
}
