import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { DailyTodoCompleteStatus } from "../enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "../enums/daily-todo-cycle.enum";
import { UserId } from "../../../user/domain/vo/user-id.vo";
import { CategoryId } from "../../../category/domain/vo/category-id.vo";

@Schema({ collection: "daily-todo" })
export class DailyTodoEntity extends BaseEntity {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: Date,
    required: true,
  })
  date: Date;

  @Prop({
    type: Types.ObjectId,
    ref: "user",
    required: true,
  })
  owner: Types.ObjectId;

  @Prop({
    type: Map,
    default: null,
  })
  reaction: {
    value: string;
    reactionUserId: Types.ObjectId;
  };

  @Prop({
    type: String,
    enum: DailyTodoCompleteStatus,
    default: DailyTodoCompleteStatus.PROGRESS,
  })
  progress: DailyTodoCompleteStatus;

  @Prop({
    type: String,
    enum: DailyTodoCycle,
    default: DailyTodoCycle.EVERYDAY,
  })
  cycle: DailyTodoCycle;

  @Prop({
    type: Types.ObjectId,
    ref: "category",
    required: true,
  })
  category: Types.ObjectId;
}

export class DailyTodoCreateEntitySchema {
  constructor(
    private readonly title: string,
    private readonly date: Date,
    private readonly owner: UserId,
    private readonly reaction: string | null,
    private readonly progress: DailyTodoCompleteStatus,
    private readonly cycle: DailyTodoCycle,
    private readonly category: CategoryId | null,
  ) {
    this.title = title;
    this.date = date;
    this.owner = owner;
    this.reaction = reaction;
    this.progress = progress;
    this.cycle = cycle;
    this.category = category;
  }

  public static of(
    title: string,
    date: Date,
    owner: UserId,
    reaction: string | null,
    progress: DailyTodoCompleteStatus,
    cycle: DailyTodoCycle,
    category: CategoryId | null,
  ): DailyTodoCreateEntitySchema {
    return new DailyTodoCreateEntitySchema(
      title,
      date,
      owner,
      reaction,
      progress,
      cycle,
      category,
    );
  }

  public get getTitle(): string {
    return this.title;
  }

  public get getDate(): Date {
    return this.date;
  }

  public get getOwner(): UserId {
    return this.owner;
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

  public get getCategory(): CategoryId | null {
    return this.category;
  }
}
