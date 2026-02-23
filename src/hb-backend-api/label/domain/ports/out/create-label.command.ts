import { UserId } from "../../../../user/domain/model/user-id.vo";
import { LabelTitle } from "../../model/label-title.vo";

export class CreateLabelCommand {
  constructor(
    private readonly title: LabelTitle,
    private readonly owner: UserId,
  ) {}

  public static of(title: LabelTitle, owner: UserId): CreateLabelCommand {
    return new CreateLabelCommand(title, owner);
  }

  get getTitle(): LabelTitle {
    return this.title;
  }

  get getOwner(): UserId {
    return this.owner;
  }
}
