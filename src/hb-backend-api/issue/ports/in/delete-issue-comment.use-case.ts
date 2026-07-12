import { IssueCommentId } from "../../domain/model/issue-comment-id.vo";

export interface DeleteIssueCommentUseCase {
  invoke(id: IssueCommentId): Promise<void>;
}
