import { CategoryId } from "../../domain/vo/category-id.vo";
import { UserId } from "../../../user/domain/vo/user-id.vo";
import { CategoryEntitySchema } from "../../domain/entity/category.entity";
import { DailyTodoId } from "../../../daily-todo/domain/vo/daily-todo-id.vo";
import { CategoryTitle } from "../../domain/vo/category-title.vo";

export class CategoryQueryResult {
  constructor(
    private readonly id: CategoryId,
    private readonly title: CategoryTitle,
    private readonly owner: UserId,
    private readonly dailyTodos: DailyTodoId[],
  ) {
    this.id = id;
    this.title = title;
    this.owner = owner;
    this.dailyTodos = dailyTodos;
  }

  public static from(entity: CategoryEntitySchema): CategoryQueryResult {
    return new CategoryQueryResult(
      entity.getId,
      entity.getTitle,
      entity.getOwner,
      entity.getDailyTodos,
    );
  }

  get getId(): CategoryId {
    return this.id;
  }

  get getTitle(): CategoryTitle {
    return this.title;
  }

  get getOwner(): UserId {
    return this.owner;
  }

  get getDailyTodos(): DailyTodoId[] {
    return this.dailyTodos;
  }
}
