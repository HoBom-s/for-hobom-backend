import { UserId } from "../../../../user/domain/model/user-id.vo";
import { LabelQueryResult } from "../out/label-query.result";

export interface GetAllLabelsUseCase {
  invoke(owner: UserId): Promise<LabelQueryResult[]>;
}
