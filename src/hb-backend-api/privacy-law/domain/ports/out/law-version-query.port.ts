import { LawVersionId } from "../../model/law-version-id.vo";
import { LawVersionEntitySchema } from "../../model/law-version.entity";

export interface LawVersionQueryPort {
  findAll(): Promise<LawVersionEntitySchema[]>;

  findById(id: LawVersionId): Promise<LawVersionEntitySchema>;

  findLatest(): Promise<LawVersionEntitySchema | null>;
}
