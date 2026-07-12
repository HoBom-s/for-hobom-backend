import { Inject, Injectable } from "@nestjs/common";
import { CreateIssueCommentUseCase } from "../../ports/in/create-issue-comment.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { IssueCommentPersistencePort } from "../../ports/out/issue-comment-persistence.port";
import { IssueHistoryPersistencePort } from "../../ports/out/issue-history-persistence.port";
import { IssueId } from "../../domain/model/issue-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { IssueHistoryAction } from "../../domain/enums/issue-history-action.enum";
import { CreateIssueCommentEntity } from "../../domain/model/issue-comment.entity";
import { CreateIssueHistoryEntity } from "../../domain/model/issue-history.entity";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class CreateIssueCommentService implements CreateIssueCommentUseCase {
  constructor(
    @Inject(DIToken.IssueModule.IssueCommentPersistencePort)
    private readonly issueCommentPersistencePort: IssueCommentPersistencePort,
    @Inject(DIToken.IssueModule.IssueHistoryPersistencePort)
    private readonly issueHistoryPersistencePort: IssueHistoryPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    issueId: IssueId,
    projectId: ProjectId,
    author: UserId,
    body: string,
  ): Promise<void> {
    await this.issueCommentPersistencePort.save(
      CreateIssueCommentEntity.of(issueId, projectId, author, body),
    );

    await this.issueHistoryPersistencePort.save(
      CreateIssueHistoryEntity.of(
        issueId,
        projectId,
        author,
        IssueHistoryAction.COMMENTED,
        [],
      ),
    );
  }
}
