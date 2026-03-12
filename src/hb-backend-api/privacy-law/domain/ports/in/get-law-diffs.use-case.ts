import { LawDiffEntitySchema } from "../../model/law-diff.entity";

export interface GetLawDiffsUseCase {
  invoke(): Promise<LawDiffEntitySchema[]>;
}
