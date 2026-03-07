import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { CreateIssueUseCase } from "../../ports/in/create-issue.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { IssuePersistencePort } from "../../ports/out/issue-persistence.port";
import { ProjectQueryPort } from "../../../project/ports/out/project-query.port";
import { ProjectPersistencePort } from "../../../project/ports/out/project-persistence.port";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { IssueType } from "../../domain/enums/issue-type.enum";
import { IssuePriority } from "../../domain/enums/issue-priority.enum";
import { CreateIssueEntity } from "../../domain/model/issue.entity";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class CreateIssueService implements CreateIssueUseCase {
  constructor(
    @Inject(DIToken.IssueModule.IssuePersistencePort)
    private readonly issuePersistencePort: IssuePersistencePort,
    @Inject(DIToken.ProjectModule.ProjectQueryPort)
    private readonly projectQueryPort: ProjectQueryPort,
    @Inject(DIToken.ProjectModule.ProjectPersistencePort)
    private readonly projectPersistencePort: ProjectPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    projectId: ProjectId,
    type: IssueType,
    title: string,
    description: string | null,
    priority: IssuePriority,
    reporter: UserId,
    assignee: UserId | null,
    sprint: Types.ObjectId | null,
    parent: Types.ObjectId | null,
    labels: string[],
  ): Promise<void> {
    const project = await this.projectQueryPort.findById(projectId);

    if (project.workflow == null) {
      throw new BadRequestException(
        "프로젝트에 워크플로우가 설정되지 않았어요.",
      );
    }

    const firstStatus = project.workflow.statuses[0];
    if (firstStatus == null) {
      throw new BadRequestException("워크플로우에 상태가 정의되지 않았어요.");
    }

    const issueNumber =
      await this.projectPersistencePort.incrementIssueSequence(projectId);

    await this.issuePersistencePort.save(
      CreateIssueEntity.of(
        projectId,
        issueNumber,
        `${project.key}-${issueNumber}`,
        type,
        title,
        description,
        firstStatus.id,
        priority,
        reporter,
        assignee,
        sprint,
        parent,
        labels,
      ),
    );
  }
}
