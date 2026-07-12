import { LawVersionId } from "../../model/law-version-id.vo";
import { LawVersionEntitySchema } from "../../model/law-version.entity";

export interface GetLawVersionByIdUseCase {
  invoke(id: LawVersionId): Promise<LawVersionEntitySchema>;
}
