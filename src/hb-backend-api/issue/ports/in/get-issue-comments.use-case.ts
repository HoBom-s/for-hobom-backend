import { IssueId } from "../../domain/model/issue-id.vo";
import { IssueCommentDocument } from "../../domain/model/issue-comment.schema";

export interface GetIssueCommentsUseCase {
  invoke(issueId: IssueId): Promise<IssueCommentDocument[]>;
}
