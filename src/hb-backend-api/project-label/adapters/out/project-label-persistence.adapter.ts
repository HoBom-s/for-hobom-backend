import { Inject, Injectable } from "@nestjs/common";
import { ProjectLabelPersistencePort } from "../../ports/out/project-label-persistence.port";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { ProjectLabelId } from "../../domain/model/project-label-id.vo";
import { CreateProjectLabelEntity } from "../../domain/model/project-label.entity";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectLabelRepository } from "../../domain/repositories/project-label.repository";

@Injectable()
export class ProjectLabelPersistenceAdapter
  implements ProjectLabelPersistencePort
{
  constructor(
    @Inject(DIToken.ProjectLabelModule.ProjectLabelRepository)
    private readonly projectLabelRepository: ProjectLabelRepository,
  ) {}

  public async save(entity: CreateProjectLabelEntity): Promise<void> {
    await this.projectLabelRepository.save(entity);
  }

  public async update(
    id: ProjectLabelId,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.projectLabelRepository.update(id, data);
  }

  public async deleteOne(id: ProjectLabelId): Promise<void> {
    await this.projectLabelRepository.deleteOne(id);
  }

  public async deleteByProject(projectId: ProjectId): Promise<void> {
    await this.projectLabelRepository.deleteByProject(projectId);
  }
}
