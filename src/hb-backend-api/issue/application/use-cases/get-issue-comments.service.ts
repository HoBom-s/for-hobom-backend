import { Inject, Injectable } from "@nestjs/common";
import { GetIssueCommentsUseCase } from "../../ports/in/get-issue-comments.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { IssueCommentQueryPort } from "../../ports/out/issue-comment-query.port";
import { IssueId } from "../../domain/model/issue-id.vo";
import { IssueCommentDocument } from "../../domain/model/issue-comment.schema";

@Injectable()
export class GetIssueCommentsService implements GetIssueCommentsUseCase {
  constructor(
    @Inject(DIToken.IssueModule.IssueCommentQueryPort)
    private readonly issueCommentQueryPort: IssueCommentQueryPort,
  ) {}

  public async invoke(issueId: IssueId): Promise<IssueCommentDocument[]> {
    return this.issueCommentQueryPort.findByIssue(issueId);
  }
}
