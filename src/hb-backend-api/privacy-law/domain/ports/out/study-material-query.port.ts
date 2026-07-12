import { StudyMaterialId } from "../../model/study-material-id.vo";
import { LawDiffId } from "../../model/law-diff-id.vo";
import { StudyMaterialEntitySchema } from "../../model/study-material.entity";

export interface StudyMaterialQueryPort {
  findAll(): Promise<StudyMaterialEntitySchema[]>;

  findById(id: StudyMaterialId): Promise<StudyMaterialEntitySchema>;

  findByDiffId(diffId: LawDiffId): Promise<StudyMaterialEntitySchema | null>;
}
