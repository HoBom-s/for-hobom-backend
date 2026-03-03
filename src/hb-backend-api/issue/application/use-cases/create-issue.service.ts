import { Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, Observable, switchMap } from "rxjs";
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
import { StatusCategory } from "../../../project/domain/enums/status-category.enum";
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
    await lastValueFrom(
      this.getProjectAndIncrement(projectId).pipe(
        switchMap(
          ({ key, issueNumber, defaultStatus, defaultStatusCategory }) =>
            this.saveIssue(
              projectId,
              issueNumber,
              `${key}-${issueNumber}`,
              type,
              title,
              description,
              defaultStatus,
              defaultStatusCategory,
              priority,
              reporter,
              assignee,
              sprint,
              parent,
              labels,
            ),
        ),
      ),
    );
  }

  private getProjectAndIncrement(projectId: ProjectId): Observable<{
    key: string;
    issueNumber: number;
    defaultStatus: string;
    defaultStatusCategory: StatusCategory;
  }> {
    return from(
      (async () => {
        const project = await this.projectQueryPort.findById(projectId);
        const issueNumber =
          await this.projectPersistencePort.incrementIssueSequence(projectId);

        const firstStatus = project.workflow?.statuses?.[0];
        const defaultStatus = firstStatus?.id ?? "TODO";
        const defaultStatusCategory =
          firstStatus?.category ?? StatusCategory.TODO;

        return {
          key: project.key,
          issueNumber,
          defaultStatus,
          defaultStatusCategory,
        };
      })(),
    );
  }

  private saveIssue(
    projectId: ProjectId,
    issueNumber: number,
    issueKey: string,
    type: IssueType,
    title: string,
    description: string | null,
    status: string,
    statusCategory: StatusCategory,
    priority: IssuePriority,
    reporter: UserId,
    assignee: UserId | null,
    sprint: Types.ObjectId | null,
    parent: Types.ObjectId | null,
    labels: string[],
  ): Observable<void> {
    return from(
      this.issuePersistencePort.save(
        CreateIssueEntity.of(
          projectId,
          issueNumber,
          issueKey,
          type,
          title,
          description,
          status,
          statusCategory,
          priority,
          reporter,
          assignee,
          sprint,
          parent,
          labels,
        ),
      ),
    );
  }
}
