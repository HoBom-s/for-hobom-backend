import {
  LabelCreateEntitySchema,
  LabelUpdateEntitySchema,
} from "./label.entity";
import { LabelId } from "./label-id.vo";
import { LabelDocument } from "./label.schema";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { LabelTitle } from "./label-title.vo";

export interface LabelRepository {
  save(schema: LabelCreateEntitySchema): Promise<void>;
  findAll(owner: UserId): Promise<LabelDocument[]>;
  findById(id: LabelId, owner: UserId): Promise<LabelDocument>;
  findByTitle(title: LabelTitle, owner: UserId): Promise<LabelDocument | null>;
  updateTitle(id: LabelId, schema: LabelUpdateEntitySchema): Promise<void>;
  deleteOne(id: LabelId, owner: UserId): Promise<void>;
}
