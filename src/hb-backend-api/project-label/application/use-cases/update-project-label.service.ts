import { Inject, Injectable } from "@nestjs/common";
import { UpdateProjectLabelUseCase } from "../../ports/in/update-project-label.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectLabelPersistencePort } from "../../ports/out/project-label-persistence.port";
import { ProjectLabelQueryPort } from "../../ports/out/project-label-query.port";
import { ProjectLabelId } from "../../domain/model/project-label-id.vo";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class UpdateProjectLabelService implements UpdateProjectLabelUseCase {
  constructor(
    @Inject(DIToken.ProjectLabelModule.ProjectLabelPersistencePort)
    private readonly projectLabelPersistencePort: ProjectLabelPersistencePort,
    @Inject(DIToken.ProjectLabelModule.ProjectLabelQueryPort)
    private readonly projectLabelQueryPort: ProjectLabelQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    id: ProjectLabelId,
    name: string,
    color: string,
  ): Promise<void> {
    await this.projectLabelQueryPort.findById(id);
    await this.projectLabelPersistencePort.update(id, { name, color });
  }
}
