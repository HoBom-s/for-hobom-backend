import { Inject, Injectable } from "@nestjs/common";
import { GetExamSetByIdUseCase } from "../../domain/ports/in/get-exam-set-by-id.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ExamSetQueryPort } from "../../domain/ports/out/exam-set-query.port";
import { ExamSetId } from "../../domain/model/exam-set-id.vo";
import { ExamSetEntitySchema } from "../../domain/model/exam-set.entity";

@Injectable()
export class GetExamSetByIdService implements GetExamSetByIdUseCase {
  constructor(
    @Inject(DIToken.PrivacyLawModule.ExamSetQueryPort)
    private readonly examSetQueryPort: ExamSetQueryPort,
  ) {}

  public async invoke(id: ExamSetId): Promise<ExamSetEntitySchema> {
    return this.examSetQueryPort.findById(id);
  }
}
