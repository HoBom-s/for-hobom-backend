import { DailyTodoCompleteStatus } from "../enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "../enums/daily-todo-cycle.enum";
import { DailyTodoId } from "../vo/daily-todo-id.vo";
import { UserId } from "../../../user/domain/vo/user-id.vo";
import { CategoryId } from "../../../category/domain/vo/category-id.vo";

export interface DailyTodoWithRelations {
  _id: string;
  title: string;
  date: Date;
  reaction: string | null;
  progress: DailyTodoCompleteStatus;
  cycle: DailyTodoCycle;
  owner: {
    id: string;
    username: string;
    nickname: string;
  };
  category: {
    id: string;
    title: string;
  } | null;
}

export class Owner {
  constructor(
    private readonly id: UserId,
    private readonly username: string,
    private readonly nickname: string,
  ) {
    this.id = id;
    this.username = username;
    this.nickname = nickname;
  }

  public static of(id: UserId, username: string, nickname: string): Owner {
    return new Owner(id, username, nickname);
  }

  public get getId(): UserId {
    return this.id;
  }

  public get getUsername(): string {
    return this.username;
  }

  public get getNickname(): string {
    return this.nickname;
  }
}

export class Category {
  constructor(
    private readonly id: CategoryId,
    private readonly title: string,
  ) {
    this.id = id;
    this.title = title;
  }

  public static of(id: CategoryId, title: string): Category {
    return new Category(id, title);
  }

  public get getId(): CategoryId {
    return this.id;
  }

  public get getTitle(): string {
    return this.title;
  }
}

export class DailyTodoWithRelationEntity {
  constructor(
    private readonly id: DailyTodoId,
    private readonly title: string,
    private readonly date: Date,
    private readonly reaction: string | null,
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

  public static of(
    id: DailyTodoId,
    title: string,
    date: Date,
    reaction: string | null,
    progress: DailyTodoCompleteStatus,
    cycle: DailyTodoCycle,
    owner: Owner,
    category: Category | null,
  ): DailyTodoWithRelationEntity {
    return new DailyTodoWithRelationEntity(
      id,
      title,
      date,
      reaction,
      progress,
      cycle,
      owner,
      category,
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

  public get getReaction(): string | null {
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
