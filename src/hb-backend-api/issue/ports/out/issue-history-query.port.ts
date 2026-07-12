import { IssueHistoryDocument } from "../../domain/model/issue-history.schema";
import { IssueId } from "../../domain/model/issue-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

export interface IssueHistoryQueryPort {
  findByIssue(issueId: IssueId): Promise<IssueHistoryDocument[]>;
  findByProject(
    projectId: ProjectId,
    startDate: Date,
    endDate: Date,
  ): Promise<IssueHistoryDocument[]>;
}
