import { Inject, Injectable } from "@nestjs/common";
import { StudyMaterialPersistencePort } from "../../domain/ports/out/study-material-persistence.port";
import { DIToken } from "../../../../shared/di/token.di";
import { StudyMaterialRepository } from "../../domain/repositories/study-material.repository";

@Injectable()
export class StudyMaterialPersistenceAdapter
  implements StudyMaterialPersistencePort
{
  constructor(
    @Inject(DIToken.PrivacyLawModule.StudyMaterialRepository)
    private readonly studyMaterialRepository: StudyMaterialRepository,
  ) {}

  public async save(data: {
    diffId: string;
    summary: string;
    keyPoints: string[];
    quizzes: {
      type: string;
      question: string;
      answer: string;
      explanation: string;
      choices: string[];
    }[];
  }): Promise<void> {
    await this.studyMaterialRepository.save(data);
  }
}
