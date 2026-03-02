import { CreateIssueCommentEntity } from "../model/issue-comment.entity";
import { IssueCommentDocument } from "../model/issue-comment.schema";
import { IssueCommentId } from "../model/issue-comment-id.vo";
import { IssueId } from "../model/issue-id.vo";

export interface IssueCommentRepository {
  save(entity: CreateIssueCommentEntity): Promise<void>;
  findByIssue(issueId: IssueId): Promise<IssueCommentDocument[]>;
  findById(id: IssueCommentId): Promise<IssueCommentDocument>;
  update(id: IssueCommentId, data: Record<string, unknown>): Promise<void>;
  softDelete(id: IssueCommentId): Promise<void>;
}
