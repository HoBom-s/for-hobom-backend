import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { CreateIssueCommentEntity } from "../../domain/model/issue-comment.entity";
import { IssueCommentId } from "../../domain/model/issue-comment-id.vo";

export interface IssueCommentPersistencePort {
  save(entity: CreateIssueCommentEntity): Promise<void>;
  update(id: IssueCommentId, data: Record<string, unknown>): Promise<void>;
  softDelete(id: IssueCommentId): Promise<void>;
  deleteByProject(projectId: ProjectId): Promise<void>;
}
