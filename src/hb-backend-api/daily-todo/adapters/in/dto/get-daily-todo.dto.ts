import { DailyTodoCompleteStatus } from "../../../domain/enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "../../../domain/enums/daily-todo-cycle.enum";
import { DailyTodoWithRelationQueryResult } from "../../../application/result/daily-todo-query.result";
import { ApiProperty } from "@nestjs/swagger";

interface OwnerType {
  id: string;
  username: string;
  nickname: string;
}

interface CategoryType {
  id: string;
  title: string;
}

interface ReactionType {
  value: string;
  reactionUserId: string;
}

class ReactionDto {
  @ApiProperty({ type: String })
  value: string;

  @ApiProperty({ type: String })
  reactionUserId: string;
}

class OwnerDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  username: string;

  @ApiProperty({ type: String })
  nickname: string;
}

class CategoryDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;
}

export class GetDailyTodoDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  date: Date;

  @ApiProperty({ type: ReactionDto || null })
  reaction: ReactionType | null;

  @ApiProperty({ enum: DailyTodoCompleteStatus })
  progress: DailyTodoCompleteStatus;

  @ApiProperty({ enum: DailyTodoCycle })
  cycle: DailyTodoCycle;

  @ApiProperty({ type: OwnerDto })
  owner: OwnerType;

  @ApiProperty({ type: CategoryDto })
  category: CategoryType;

  constructor(
    id: string,
    title: string,
    date: Date,
    reaction: ReactionType | null,
    progress: DailyTodoCompleteStatus,
    cycle: DailyTodoCycle,
    owner: OwnerType,
    category: CategoryType,
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
    const category: CategoryType = {
      id: entity.getCategory.getId.toString(),
      title: entity.getCategory.getTitle,
    };
    const reaction: ReactionType | null =
      entity.getReaction == null
        ? null
        : {
            value: entity.getReaction.getValue,
            reactionUserId: entity.getReaction.getReactionUserId.toString(),
          };
    return new GetDailyTodoDto(
      entity.getId.toString(),
      entity.getTitle,
      entity.getDate,
      reaction,
      entity.getProgress,
      entity.getCycle,
      owner,
      category,
    );
  }
}
