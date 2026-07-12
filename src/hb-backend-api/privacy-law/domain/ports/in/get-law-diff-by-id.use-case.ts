import { LawDiffId } from "../../model/law-diff-id.vo";
import { LawDiffEntitySchema } from "../../model/law-diff.entity";

export interface GetLawDiffByIdUseCase {
  invoke(id: LawDiffId): Promise<LawDiffEntitySchema>;
}
