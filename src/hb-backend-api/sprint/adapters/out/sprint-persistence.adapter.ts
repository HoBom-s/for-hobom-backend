import { Inject, Injectable } from "@nestjs/common";
import { SprintPersistencePort } from "../../ports/out/sprint-persistence.port";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { DIToken } from "../../../../shared/di/token.di";
import { SprintRepository } from "../../domain/repositories/sprint.repository";
import { CreateSprintEntity } from "../../domain/model/sprint.entity";
import { SprintId } from "../../domain/model/sprint-id.vo";

@Injectable()
export class SprintPersistenceAdapter implements SprintPersistencePort {
  constructor(
    @Inject(DIToken.SprintModule.SprintRepository)
    private readonly sprintRepository: SprintRepository,
  ) {}

  public async save(entity: CreateSprintEntity): Promise<void> {
    await this.sprintRepository.save(entity);
  }

  public async update(
    id: SprintId,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.sprintRepository.update(id, data);
  }

  public async deleteOne(id: SprintId): Promise<void> {
    await this.sprintRepository.deleteOne(id);
  }

  public async deleteByProject(projectId: ProjectId): Promise<void> {
    await this.sprintRepository.deleteByProject(projectId);
  }
}
