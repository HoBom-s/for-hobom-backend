import { CategoryTitle } from "../../model/category-title.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";

export class PatchCategoryCommand {
  constructor(
    private readonly title: CategoryTitle,
    private readonly owner: UserId,
  ) {
    this.title = title;
    this.owner = owner;
  }

  public static of(title: CategoryTitle, owner: UserId): PatchCategoryCommand {
    return new PatchCategoryCommand(title, owner);
  }

  get getTitle(): CategoryTitle {
    return this.title;
  }

  get getOwner(): UserId {
    return this.owner;
  }
}
