import { LabelId } from "../../model/label-id.vo";
import { LabelEntitySchema } from "../../model/label.entity";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { LabelTitle } from "../../model/label-title.vo";

export interface LabelQueryPort {
  findById(id: LabelId, owner: UserId): Promise<LabelEntitySchema>;
  findAll(owner: UserId): Promise<LabelEntitySchema[]>;
  findByTitle(
    title: LabelTitle,
    owner: UserId,
  ): Promise<LabelEntitySchema | null>;
}
