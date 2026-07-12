import { CreateIssueHistoryEntity } from "../model/issue-history.entity";
import { IssueHistoryDocument } from "../model/issue-history.schema";
import { IssueId } from "../model/issue-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

export interface IssueHistoryRepository {
  save(entity: CreateIssueHistoryEntity): Promise<void>;
  findByIssue(issueId: IssueId): Promise<IssueHistoryDocument[]>;
  findByProject(
    projectId: ProjectId,
    startDate: Date,
    endDate: Date,
  ): Promise<IssueHistoryDocument[]>;
  deleteByProject(projectId: ProjectId): Promise<void>;
}
