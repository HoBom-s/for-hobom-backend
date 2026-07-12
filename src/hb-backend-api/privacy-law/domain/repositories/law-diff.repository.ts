import { LawDiffId } from "../model/law-diff-id.vo";
import { LawVersionId } from "../model/law-version-id.vo";
import { LawDiffDocument } from "../model/law-diff.schema";
import { ChangeType } from "../enums/change-type.enum";

export interface LawDiffRepository {
  save(data: {
    fromVersionId: string;
    toVersionId: string;
    fromProclamationDate: string;
    toProclamationDate: string;
    changes: {
      articleNo: string;
      changeType: ChangeType;
      before: string | null;
      after: string | null;
    }[];
  }): Promise<void>;
  findAll(): Promise<LawDiffDocument[]>;
  findById(id: LawDiffId): Promise<LawDiffDocument>;
  findByVersionId(versionId: LawVersionId): Promise<LawDiffDocument[]>;
}
