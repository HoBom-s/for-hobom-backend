import {
  LabelCreateEntitySchema,
  LabelUpdateEntitySchema,
} from "../../model/label.entity";
import { LabelId } from "../../model/label-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";

export interface LabelPersistencePort {
  save(schema: LabelCreateEntitySchema): Promise<void>;
  updateOne(id: LabelId, schema: LabelUpdateEntitySchema): Promise<void>;
  deleteOne(id: LabelId, owner: UserId): Promise<void>;
}
