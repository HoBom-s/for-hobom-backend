import { Inject, Injectable } from "@nestjs/common";
import { IssueCommentQueryPort } from "../../ports/out/issue-comment-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { IssueCommentRepository } from "../../domain/repositories/issue-comment.repository";
import { IssueCommentDocument } from "../../domain/model/issue-comment.schema";
import { IssueCommentId } from "../../domain/model/issue-comment-id.vo";
import { IssueId } from "../../domain/model/issue-id.vo";

@Injectable()
export class IssueCommentQueryAdapter implements IssueCommentQueryPort {
  constructor(
    @Inject(DIToken.IssueModule.IssueCommentRepository)
    private readonly issueCommentRepository: IssueCommentRepository,
  ) {}

  public async findByIssue(issueId: IssueId): Promise<IssueCommentDocument[]> {
    return this.issueCommentRepository.findByIssue(issueId);
  }

  public async findById(id: IssueCommentId): Promise<IssueCommentDocument> {
    return this.issueCommentRepository.findById(id);
  }
}
