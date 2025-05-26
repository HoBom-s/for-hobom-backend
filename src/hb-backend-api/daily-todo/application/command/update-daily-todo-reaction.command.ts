export class UpdateDailyTodoReactionCommand {
  constructor(private readonly reaction: string) {
    this.reaction = reaction;
  }

  public static of(reaction: string): UpdateDailyTodoReactionCommand {
    return new UpdateDailyTodoReactionCommand(reaction);
  }

  public get getReaction(): string {
    return this.reaction;
  }
}
