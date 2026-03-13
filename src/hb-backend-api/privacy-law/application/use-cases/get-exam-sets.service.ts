import { Inject, Injectable } from "@nestjs/common";
import { GetExamSetsUseCase } from "../../domain/ports/in/get-exam-sets.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ExamSetQueryPort } from "../../domain/ports/out/exam-set-query.port";
import { ExamSetEntitySchema } from "../../domain/model/exam-set.entity";

@Injectable()
export class GetExamSetsService implements GetExamSetsUseCase {
  constructor(
    @Inject(DIToken.PrivacyLawModule.ExamSetQueryPort)
    private readonly examSetQueryPort: ExamSetQueryPort,
  ) {}

  public async invoke(): Promise<ExamSetEntitySchema[]> {
    return this.examSetQueryPort.findAll();
  }
}
