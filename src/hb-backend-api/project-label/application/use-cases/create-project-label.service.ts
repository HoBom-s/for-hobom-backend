import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CreateProjectLabelUseCase } from "../../ports/in/create-project-label.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectLabelPersistencePort } from "../../ports/out/project-label-persistence.port";
import { ProjectLabelQueryPort } from "../../ports/out/project-label-query.port";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { CreateProjectLabelEntity } from "../../domain/model/project-label.entity";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class CreateProjectLabelService implements CreateProjectLabelUseCase {
  constructor(
    @Inject(DIToken.ProjectLabelModule.ProjectLabelPersistencePort)
    private readonly projectLabelPersistencePort: ProjectLabelPersistencePort,
    @Inject(DIToken.ProjectLabelModule.ProjectLabelQueryPort)
    private readonly projectLabelQueryPort: ProjectLabelQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    projectId: ProjectId,
    name: string,
    color: string,
  ): Promise<void> {
    const labels = await this.projectLabelQueryPort.findByProject(projectId);
    const duplicate = labels.find((label) => label.name === name);
    if (duplicate != null) {
      throw new BadRequestException(
        `이미 존재하는 프로젝트 라벨이에요. ${name}`,
      );
    }

    await this.projectLabelPersistencePort.save(
      CreateProjectLabelEntity.of(projectId, name, color),
    );
  }
}
