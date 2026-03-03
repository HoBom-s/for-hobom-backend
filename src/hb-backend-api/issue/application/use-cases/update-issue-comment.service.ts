import { Inject, Injectable } from "@nestjs/common";
import { UpdateIssueCommentUseCase } from "../../ports/in/update-issue-comment.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { IssueCommentPersistencePort } from "../../ports/out/issue-comment-persistence.port";
import { IssueCommentId } from "../../domain/model/issue-comment-id.vo";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class UpdateIssueCommentService implements UpdateIssueCommentUseCase {
  constructor(
    @Inject(DIToken.IssueModule.IssueCommentPersistencePort)
    private readonly issueCommentPersistencePort: IssueCommentPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(id: IssueCommentId, body: string): Promise<void> {
    await this.issueCommentPersistencePort.update(id, { body });
  }
}
