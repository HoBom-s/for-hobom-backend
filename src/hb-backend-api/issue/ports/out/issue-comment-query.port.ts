import { IssueCommentDocument } from "../../domain/model/issue-comment.schema";
import { IssueCommentId } from "../../domain/model/issue-comment-id.vo";
import { IssueId } from "../../domain/model/issue-id.vo";

export interface IssueCommentQueryPort {
  findByIssue(issueId: IssueId): Promise<IssueCommentDocument[]>;
  findById(id: IssueCommentId): Promise<IssueCommentDocument>;
}
