export class UpdateFutureMessageCommand {
  constructor(
    private readonly title?: string,
    private readonly content?: string,
    private readonly scheduledAt?: string,
  ) {}

  public static of(
    title?: string,
    content?: string,
    scheduledAt?: string,
  ): UpdateFutureMessageCommand {
    return new UpdateFutureMessageCommand(title, content, scheduledAt);
  }

  public get getTitle(): string | undefined {
    return this.title;
  }

  public get getContent(): string | undefined {
    return this.content;
  }

  public get getScheduledAt(): string | undefined {
    return this.scheduledAt;
  }
}
