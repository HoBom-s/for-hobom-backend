import { Reaction } from "../../domain/entity/daily-todo.retations";

export class UpdateDailyTodoReactionCommand {
  constructor(private readonly reaction: Reaction) {
    this.reaction = reaction;
  }

  public static of(reaction: Reaction): UpdateDailyTodoReactionCommand {
    return new UpdateDailyTodoReactionCommand(reaction);
  }

  public get getReaction(): Reaction {
    return this.reaction;
  }
}
