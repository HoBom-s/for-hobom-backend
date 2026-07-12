import { IssueId } from "../../domain/model/issue-id.vo";

export interface DeleteIssueUseCase {
  invoke(id: IssueId): Promise<void>;
}
