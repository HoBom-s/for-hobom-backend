import { Inject, Injectable } from "@nestjs/common";
import { GetStudyMaterialsUseCase } from "../../domain/ports/in/get-study-materials.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { StudyMaterialQueryPort } from "../../domain/ports/out/study-material-query.port";
import { StudyMaterialEntitySchema } from "../../domain/model/study-material.entity";

@Injectable()
export class GetStudyMaterialsService implements GetStudyMaterialsUseCase {
  constructor(
    @Inject(DIToken.PrivacyLawModule.StudyMaterialQueryPort)
    private readonly studyMaterialQueryPort: StudyMaterialQueryPort,
  ) {}

  public async invoke(): Promise<StudyMaterialEntitySchema[]> {
    return this.studyMaterialQueryPort.findAll();
  }
}
