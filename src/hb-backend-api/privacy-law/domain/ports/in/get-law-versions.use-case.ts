import { LawVersionEntitySchema } from "../../model/law-version.entity";

export interface GetLawVersionsUseCase {
  invoke(): Promise<LawVersionEntitySchema[]>;
}
