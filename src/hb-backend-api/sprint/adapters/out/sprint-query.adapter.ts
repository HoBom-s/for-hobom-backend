import { Inject, Injectable } from "@nestjs/common";
import { SprintQueryPort } from "../../ports/out/sprint-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { SprintRepository } from "../../domain/repositories/sprint.repository";
import { SprintDocument } from "../../domain/model/sprint.schema";
import { SprintId } from "../../domain/model/sprint-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

@Injectable()
export class SprintQueryAdapter implements SprintQueryPort {
  constructor(
    @Inject(DIToken.SprintModule.SprintRepository)
    private readonly sprintRepository: SprintRepository,
  ) {}

  public async findById(id: SprintId): Promise<SprintDocument> {
    return this.sprintRepository.findById(id);
  }

  public async findByProject(projectId: ProjectId): Promise<SprintDocument[]> {
    return this.sprintRepository.findByProject(projectId);
  }

  public async findActiveSprint(
    projectId: ProjectId,
  ): Promise<SprintDocument | null> {
    return this.sprintRepository.findActiveSprint(projectId);
  }
}
