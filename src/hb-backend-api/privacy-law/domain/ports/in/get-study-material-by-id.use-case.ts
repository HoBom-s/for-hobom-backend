import { StudyMaterialId } from "../../model/study-material-id.vo";
import { StudyMaterialEntitySchema } from "../../model/study-material.entity";

export interface GetStudyMaterialByIdUseCase {
  invoke(id: StudyMaterialId): Promise<StudyMaterialEntitySchema>;
}
