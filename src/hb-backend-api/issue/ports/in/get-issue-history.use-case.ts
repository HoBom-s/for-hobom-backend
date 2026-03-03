import { IssueId } from "../../domain/model/issue-id.vo";
import { IssueHistoryDocument } from "../../domain/model/issue-history.schema";

export interface GetIssueHistoryUseCase {
  invoke(issueId: IssueId): Promise<IssueHistoryDocument[]>;
}
