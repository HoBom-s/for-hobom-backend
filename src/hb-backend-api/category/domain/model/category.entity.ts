import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { CategoryId } from "./category-id.vo";
import { DailyTodoId } from "../../../daily-todo/domain/vo/daily-todo-id.vo";
import { CategoryTitle } from "./category-title.vo";

@Schema({ collection: "category" })
export class CategoryEntity extends BaseEntity {
  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
  })
  title: string;

  @Prop({
    type: Types.ObjectId,
    ref: "user",
    required: true,
    index: true,
  })
  owner: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: "daily-todo", default: [] })
  dailyTodos: Types.ObjectId[];
}

export class CategoryEntitySchema {
  constructor(
    private readonly id: CategoryId,
    private readonly title: CategoryTitle,
    private readonly owner: UserId,
    private readonly dailyTodos: DailyTodoId[],
  ) {
    this.id = id;
    this.title = title;
    this.owner = owner;
  }

  public static of(
    id: CategoryId,
    title: CategoryTitle,
    owner: UserId,
    dailyTodos: DailyTodoId[],
  ): CategoryEntitySchema {
    return new CategoryEntitySchema(id, title, owner, dailyTodos);
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

export class CategoryCreateEntitySchema {
  constructor(
    private readonly title: CategoryTitle,
    private readonly owner: UserId,
  ) {
    this.title = title;
    this.owner = owner;
  }

  public static of(
    title: CategoryTitle,
    owner: UserId,
  ): CategoryCreateEntitySchema {
    return new CategoryCreateEntitySchema(title, owner);
  }

  get getTitle(): CategoryTitle {
    return this.title;
  }

  get getOwner(): UserId {
    return this.owner;
  }
}

export class CategoryUpdateEntitySchema {
  constructor(
    private readonly title: CategoryTitle,
    private readonly owner: UserId,
  ) {
    this.title = title;
    this.owner = owner;
  }

  public static of(
    title: CategoryTitle,
    owner: UserId,
  ): CategoryUpdateEntitySchema {
    return new CategoryUpdateEntitySchema(title, owner);
  }

  get getTitle(): CategoryTitle {
    return this.title;
  }

  get getOwner(): UserId {
    return this.owner;
  }
}
