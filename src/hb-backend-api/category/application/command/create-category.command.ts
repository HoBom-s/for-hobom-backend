import { UserId } from "../../../user/domain/vo/user-id.vo";

export class CreateCategoryCommand {
  constructor(
    private readonly title: string,
    private readonly owner: UserId,
  ) {
    this.title = title;
    this.owner = owner;
  }

  public static of(title: string, owner: UserId): CreateCategoryCommand {
    return new CreateCategoryCommand(title, owner);
  }

  get getTitle(): string {
    return this.title;
  }

  get getOwner(): UserId {
    return this.owner;
  }
}
