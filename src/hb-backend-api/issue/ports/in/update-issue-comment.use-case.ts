import { IssueCommentId } from "../../domain/model/issue-comment-id.vo";

export interface UpdateIssueCommentUseCase {
  invoke(id: IssueCommentId, body: string): Promise<void>;
}
