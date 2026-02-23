import { LabelId } from "../../model/label-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { LabelQueryResult } from "../out/label-query.result";

export interface GetLabelUseCase {
  invoke(id: LabelId, owner: UserId): Promise<LabelQueryResult>;
}
