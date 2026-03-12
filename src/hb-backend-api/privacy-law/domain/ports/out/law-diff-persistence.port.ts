import { ChangeType } from "../../enums/change-type.enum";

export interface LawDiffPersistencePort {
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
}
