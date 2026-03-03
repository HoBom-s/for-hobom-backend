import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CreateProjectUseCase } from "../../ports/in/create-project.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectPersistencePort } from "../../ports/out/project-persistence.port";
import { ProjectQueryPort } from "../../ports/out/project-query.port";
import { ProjectKey } from "../../domain/model/project-key.vo";
import { ProjectId } from "../../domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { CreateProjectEntity } from "../../domain/model/project.entity";
import {
  DEFAULT_ISSUE_TYPES,
  DEFAULT_PRIORITIES,
  DEFAULT_WORKFLOW,
} from "../../domain/constants/project-defaults.constant";

@Injectable()
export class CreateProjectService implements CreateProjectUseCase {
  constructor(
    @Inject(DIToken.ProjectModule.ProjectPersistencePort)
    private readonly projectPersistencePort: ProjectPersistencePort,
    @Inject(DIToken.ProjectModule.ProjectQueryPort)
    private readonly projectQueryPort: ProjectQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    key: ProjectKey,
    name: string,
    description: string | null,
    owner: UserId,
  ): Promise<void> {
    const existing = await this.projectQueryPort.findByKey(key);
    if (existing != null) {
      throw new BadRequestException(
        `이미 존재하는 프로젝트 키에요. ${key.raw}`,
      );
    }

    await this.projectPersistencePort.save(
      CreateProjectEntity.of(key, name, description, owner),
    );

    const project = await this.projectQueryPort.findByKey(key);
    if (project == null) {
      throw new BadRequestException("프로젝트 저장 후 조회에 실패했어요.");
    }

    const projectId = ProjectId.fromString(String(project._id));
    await this.projectPersistencePort.update(projectId, {
      workflow: DEFAULT_WORKFLOW,
      issueTypes: DEFAULT_ISSUE_TYPES,
      priorities: DEFAULT_PRIORITIES,
    });
  }
}
