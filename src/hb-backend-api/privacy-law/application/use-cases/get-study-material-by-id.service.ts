import { Inject, Injectable } from "@nestjs/common";
import { GetStudyMaterialByIdUseCase } from "../../domain/ports/in/get-study-material-by-id.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { StudyMaterialQueryPort } from "../../domain/ports/out/study-material-query.port";
import { StudyMaterialId } from "../../domain/model/study-material-id.vo";
import { StudyMaterialEntitySchema } from "../../domain/model/study-material.entity";

@Injectable()
export class GetStudyMaterialByIdService implements GetStudyMaterialByIdUseCase {
  constructor(
    @Inject(DIToken.PrivacyLawModule.StudyMaterialQueryPort)
    private readonly studyMaterialQueryPort: StudyMaterialQueryPort,
  ) {}

  public async invoke(id: StudyMaterialId): Promise<StudyMaterialEntitySchema> {
    return this.studyMaterialQueryPort.findById(id);
  }
}
