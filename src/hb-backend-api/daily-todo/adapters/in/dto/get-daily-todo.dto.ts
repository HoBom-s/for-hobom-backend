import { DailyTodoCompleteStatus } from "../../../domain/enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "../../../domain/enums/daily-todo-cycle.enum";
import { DailyTodoWithRelationQueryResult } from "../../../application/ports/out/daily-todo-query.result";

interface OwnerType {
  id: string;
  username: string;
  nickname: string;
}

interface CategoryType {
  id: string;
  title: string;
}

export class GetDailyTodoDto {
  constructor(
    private readonly id: string,
    private readonly title: string,
    private readonly date: Date,
    private readonly reaction: string | null,
    private readonly progress: DailyTodoCompleteStatus,
    private readonly cycle: DailyTodoCycle,
    private readonly owner: OwnerType,
    private readonly category: CategoryType | null,
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
    entity: DailyTodoWithRelationQueryResult,
  ): GetDailyTodoDto {
    const owner: OwnerType = {
      id: entity.getOwner.getId.toString(),
      username: entity.getOwner.getUsername,
      nickname: entity.getOwner.getNickname,
    };
    const category: CategoryType | null =
      entity.getCategory == null
        ? null
        : {
            id: entity.getCategory.getId.toString(),
            title: entity.getCategory.getTitle,
          };
    return new GetDailyTodoDto(
      entity.getId.toString(),
      entity.getTitle,
      entity.getDate,
      entity.getReaction,
      entity.getProgress,
      entity.getCycle,
      owner,
      category,
    );
  }
}
