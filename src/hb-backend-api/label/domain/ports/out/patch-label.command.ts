import { LabelTitle } from "../../model/label-title.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";

export class PatchLabelCommand {
  constructor(
    private readonly title: LabelTitle,
    private readonly owner: UserId,
  ) {}

  public static of(title: LabelTitle, owner: UserId): PatchLabelCommand {
    return new PatchLabelCommand(title, owner);
  }

  get getTitle(): LabelTitle {
    return this.title;
  }

  get getOwner(): UserId {
    return this.owner;
  }
}
