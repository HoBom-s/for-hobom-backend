import { Inject, Injectable } from "@nestjs/common";
import { GetSprintUseCase } from "../../ports/in/get-sprint.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { SprintQueryPort } from "../../ports/out/sprint-query.port";
import { SprintDocument } from "../../domain/model/sprint.schema";
import { SprintId } from "../../domain/model/sprint-id.vo";

@Injectable()
export class GetSprintService implements GetSprintUseCase {
  constructor(
    @Inject(DIToken.SprintModule.SprintQueryPort)
    private readonly sprintQueryPort: SprintQueryPort,
  ) {}

  public async invoke(id: SprintId): Promise<SprintDocument> {
    return this.sprintQueryPort.findById(id);
  }
}
