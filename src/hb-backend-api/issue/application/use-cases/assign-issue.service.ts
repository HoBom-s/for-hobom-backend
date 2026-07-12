import { Inject, Injectable } from "@nestjs/common";
import { AssignIssueUseCase } from "../../ports/in/assign-issue.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { IssuePersistencePort } from "../../ports/out/issue-persistence.port";
import { IssueQueryPort } from "../../ports/out/issue-query.port";
import { IssueHistoryPersistencePort } from "../../ports/out/issue-history-persistence.port";
import { IssueId } from "../../domain/model/issue-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { IssueHistoryAction } from "../../domain/enums/issue-history-action.enum";
import { CreateIssueHistoryEntity } from "../../domain/model/issue-history.entity";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class AssignIssueService implements AssignIssueUseCase {
  constructor(
    @Inject(DIToken.IssueModule.IssuePersistencePort)
    private readonly issuePersistencePort: IssuePersistencePort,
    @Inject(DIToken.IssueModule.IssueQueryPort)
    private readonly issueQueryPort: IssueQueryPort,
    @Inject(DIToken.IssueModule.IssueHistoryPersistencePort)
    private readonly issueHistoryPersistencePort: IssueHistoryPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    id: IssueId,
    assignee: UserId | null,
    actor: UserId,
  ): Promise<void> {
    const issue = await this.issueQueryPort.findById(id);

    await this.issuePersistencePort.update(id, {
      assignee: assignee?.raw ?? null,
    });

    await this.issueHistoryPersistencePort.save(
      CreateIssueHistoryEntity.of(
        id,
        ProjectId.fromString(String(issue.project)),
        actor,
        IssueHistoryAction.ASSIGNED,
        [
          {
            field: "assignee",
            from: issue.assignee != null ? String(issue.assignee) : null,
            to: assignee != null ? assignee.toString() : null,
          },
        ],
      ),
    );
  }
}
