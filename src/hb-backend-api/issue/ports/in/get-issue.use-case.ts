import { IssueId } from "../../domain/model/issue-id.vo";
import { IssueDocument } from "../../domain/model/issue.schema";

export interface GetIssueUseCase {
  invoke(id: IssueId): Promise<IssueDocument>;
}
