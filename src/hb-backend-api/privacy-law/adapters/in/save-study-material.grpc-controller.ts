import { Controller, Inject, Logger, UseGuards } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { RpcException } from "@nestjs/microservices";
import { status } from "@grpc/grpc-js";
import { DIToken } from "../../../../shared/di/token.di";
import { StudyMaterialPersistencePort } from "../../domain/ports/out/study-material-persistence.port";
import { GrpcApiKeyGuard } from "../../../../shared/adapters/in/grpc/guard/grpc-api-key.guard";

@Controller()
@UseGuards(GrpcApiKeyGuard)
export class SaveStudyMaterialGrpcController {
  private readonly logger = new Logger(SaveStudyMaterialGrpcController.name);

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
    if (!request.diffId || !request.summary) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: "diffId와 summary는 필수입니다.",
      });
    }

    try {
      await this.studyMaterialPersistencePort.save({
        diffId: request.diffId,
        summary: request.summary,
        keyPoints: request.keyPoints ?? [],
        quizzes: request.quizzes ?? [],
      });
      this.logger.log(`학습자료 저장 완료: diffId=${request.diffId}`);
    } catch (error) {
      this.logger.error(`학습자료 저장 실패: diffId=${request.diffId}`, error);
      throw new RpcException({
        code: status.INTERNAL,
        message: "학습자료 저장에 실패했어요.",
      });
    }
  }
}
