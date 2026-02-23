import { LabelId } from "../../model/label-id.vo";
import { LabelTitle } from "../../model/label-title.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { LabelEntitySchema } from "../../model/label.entity";

export class LabelQueryResult {
  constructor(
    private readonly id: LabelId,
    private readonly title: LabelTitle,
    private readonly owner: UserId,
  ) {}

  public static from(entity: LabelEntitySchema): LabelQueryResult {
    return new LabelQueryResult(entity.getId, entity.getTitle, entity.getOwner);
  }

  get getId(): LabelId {
    return this.id;
  }

  get getTitle(): LabelTitle {
    return this.title;
  }

  get getOwner(): UserId {
    return this.owner;
  }
}
