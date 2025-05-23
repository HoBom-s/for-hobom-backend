import { UserId } from "../../../user/domain/vo/user-id.vo";
import { CategoryTitle } from "../../domain/vo/category-title.vo";

export class CreateCategoryCommand {
  constructor(
    private readonly title: CategoryTitle,
    private readonly owner: UserId,
  ) {
    this.title = title;
    this.owner = owner;
  }

  public static of(title: CategoryTitle, owner: UserId): CreateCategoryCommand {
    return new CreateCategoryCommand(title, owner);
  }

  get getTitle(): CategoryTitle {
    return this.title;
  }

  get getOwner(): UserId {
    return this.owner;
  }
}
