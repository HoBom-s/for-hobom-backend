import { Controller, Inject, UseGuards } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { DIToken } from "../../../../shared/di/token.di";
import { StudyMaterialPersistencePort } from "../../domain/ports/out/study-material-persistence.port";
import { GrpcApiKeyGuard } from "../../../../shared/adapters/in/grpc/guard/grpc-api-key.guard";

@Controller()
@UseGuards(GrpcApiKeyGuard)
export class SaveStudyMaterialGrpcController {
  constructor(
    @Inject(DIToken.PrivacyLawModule.StudyMaterialPersistencePort)
    private readonly studyMaterialPersistencePort: StudyMaterialPersistencePort,
  ) {}

  @GrpcMethod("SaveStudyMaterialController", "SaveStudyMaterial")
  public async saveStudyMaterial(request: {
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
    await this.studyMaterialPersistencePort.save({
      diffId: request.diffId,
      summary: request.summary,
      keyPoints: request.keyPoints,
      quizzes: request.quizzes,
    });
  }
}
