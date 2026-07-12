import { StudyMaterialEntitySchema } from "../../model/study-material.entity";

export interface GetStudyMaterialsUseCase {
  invoke(): Promise<StudyMaterialEntitySchema[]>;
}
