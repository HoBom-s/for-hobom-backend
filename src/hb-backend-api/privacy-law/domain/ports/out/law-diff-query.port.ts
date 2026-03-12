import { LawDiffId } from "../../model/law-diff-id.vo";
import { LawVersionId } from "../../model/law-version-id.vo";
import { LawDiffEntitySchema } from "../../model/law-diff.entity";

export interface LawDiffQueryPort {
  findAll(): Promise<LawDiffEntitySchema[]>;

  findById(id: LawDiffId): Promise<LawDiffEntitySchema>;

  findByVersionId(versionId: LawVersionId): Promise<LawDiffEntitySchema[]>;
}
