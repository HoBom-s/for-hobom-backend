import { LabelId } from "../../model/label-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";

export interface DeleteLabelUseCase {
  invoke(id: LabelId, owner: UserId): Promise<void>;
}
