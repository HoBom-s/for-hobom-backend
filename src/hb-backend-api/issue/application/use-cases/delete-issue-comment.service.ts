import { Inject, Injectable } from "@nestjs/common";
import { DeleteIssueCommentUseCase } from "../../ports/in/delete-issue-comment.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { IssueCommentPersistencePort } from "../../ports/out/issue-comment-persistence.port";
import { IssueCommentId } from "../../domain/model/issue-comment-id.vo";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class DeleteIssueCommentService implements DeleteIssueCommentUseCase {
  constructor(
    @Inject(DIToken.IssueModule.IssueCommentPersistencePort)
    private readonly issueCommentPersistencePort: IssueCommentPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(id: IssueCommentId): Promise<void> {
    await this.issueCommentPersistencePort.softDelete(id);
  }
}
